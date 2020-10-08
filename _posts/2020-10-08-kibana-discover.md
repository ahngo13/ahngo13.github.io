---
title: ElasticSearch Kibana Discover 파헤치기
layout: post
date: '2020-10-08 17:59:00 +0300'
description: 데이터를 탐색하고 숨겨진 통찰력과 관계를 찾고 질문에 대한 답변을 얻을 수 있음
img: null
fig-caption: null
tags:
- es
- elasticsearch
- kibana
- kibanadiscover
- 키바나
- 엘라스틱서치
---

- 데이터를 탐색하고 숨겨진 통찰력과 관계를 찾고 질문에 대한 답변을 얻을 수 있음

# Discover의 기능

- 선택한 index pattern과 일치하는 모든 index document에 접근
- 데이터를 검색하고 검색 결과를 필터링
- 검색과 일치하는 문서에 대한 필드 수준 세부 정보 조회
- 문서 직전과 직후에 발생한 이벤트 보기

# Index pattern 만들기

- index pattern이 없으면 kibana에서 데이터를 탐색하고 시각화 할 수 없음
- index pattern은 작업하려는 데이터가 포함된 Elastic Search index를 Kibana에 알려줌

`Stack Management > Kibana > Index Patterns`

## Index pattern

- 이름이 고유한지 확인
- 와일드 카드 표기법 (*, -) 적용가능

## Standard index pattern

- 일반적인 index pattern

![/assets/img/discover1.png](/assets/img/discover1.png)

## **Rollup index pattern**

- 콤마(`,`)로 구분하여 여러 인덱스를 포함

## **Cross-cluster search index pattern**

- Elasticsearch 클러스터가 클러스터 간 검색 용으로 구성된 경우 선택한 클러스터에서 검색 할 인덱스 패턴을 생성 할 수 있음
    - `<cluster-names>:<pattern>`

# 시간 필터 설정

- 색인에 시간 기반 이벤트가 포함되어 있을 경우에만 설정 가능
- 시작 및 종료시간 설정 : Absolute , Relative 또는 Now로 가능
- 히스토그램에서 시간 범위 선택 가능 : 드래그 앤 드롭, 막대 클릭, 드롭다운

![/assets/img/discover2.png](/assets/img/discover2.png)

# 데이터 검색

- Kibana 앱에는 Discover , Visualize 및 Dashboard를 포함한 실시간 검색을위한 쿼리 표시 줄이 포함
- Lucene, KQL(Kibana Query Language) 중 선택 가능

![/assets/img/discover3.png](/assets/img/discover3.png)

## 검색 결과 새로고침

- 시간 필터를 사용하면 검색을 주기적으로 다시 제출하여 최신 결과를 검색하도록 새로 고침 간격을 구성 할 수 있음
- 새로고침 버튼 을 클릭하여 검색 결과를 수동으로 새로 고칠 수도 있음

## 많은 양의 데이터 검색

- 쿼리를 실행하고 런타임이 제한 시간에 가까워지면 제한 시간을 무시할 수있는 옵션이 표시
- timeout은 기본 30초 (클러스터에 대한 의도하지 않은로드를 방지하기 위해 적용)

## Kibana Query Language

### term query

```bash
keyword : "삼성 노트북 pen s"
```

![/assets/img/discover4.png](/assets/img/discover4.png)

### Boolean queries

- 기본 우선 순위를 무시하려면 연산자를 괄호로 묶음
- `and` , `or`, `not`

```bash
## 아래 처럼 데이터가 검색됨
keyword : "삼성 노트북 pen s" or keyword:"삼성 노트북"

## 아무것도 안나옴
keyword : "삼성 노트북 pen s" and keyword:"삼성 노트북"
```

![/assets/img/discover5.png](/assets/img/discover5.png)

### Range query

- >, >=, <, ≤를 제공

```bash
account_number:>=100 and items_sold:<=200
```

### Exist queries

- 존재 여부 확인하는 쿼리

```bash
response:*
```

### Wildcard queries

- 텍스트 및 키워드 버전이 있을 때 유용

```bash
machine.os:win*
machine.os*:windows 10
```

### Nested field queries

- 중첩된 필드에서 사용하는 쿼리

```bash
{
  "grocery_name": "Elastic Eats",
  "items": [
    {
      "name": "banana",
      "stock": "12",
      "category": "fruit"
    },
    {
      "name": "peach",
      "stock": "10",
      "category": "fruit"
    },
    {
      "name": "carrot",
      "stock": "9",
      "category": "vegetable"
    },
    {
      "name": "broccoli",
      "stock": "5",
      "category": "vegetable"
    }
  ]
}
```

- 단일 문서 일치

```bash
items:{ name:banana and stock:9 }
```

- 다른 문서 일치

```bash
items:{ name:banana } and items:{ stock:9 }
```

### Nested fields inside other nested fields

- 다른 중첩 필드의 내부 중첩 필드

```bash
{
  "level1": [
    {
      "level2": [
        {
          "prop1": "foo",
          "prop2": "bar"
        },
        {
          "prop1": "baz",
          "prop2": "qux"
        }
      ]
    }
  ]
}
```

```bash
level1.level2:{ prop1:foo and prop2:bar }
```

## 검색 저장

1. 상단 메뉴에서 Save 클릭
2. 검색 이름을 지정하고 저장 클릭

## 저장된 검색 열기

1. 상단 메뉴에서 Open 클릭
2. 열려는 검색 선택

## Save a Query (쿼리 저장)

1. KQL 입력하는 왼쪽 디스켓 모양의 버튼 클릭
2. 사용했던 쿼리를 저장할 수 있음
3. 쿼리 목록 중 항목을 선택하면 해당 쿼리를 로드할 수 있음
4. 삭제는 해당 쿼리 항목에 마우스를 대면 쓰레기통 모양 버튼이 나오는데 클릭하면 삭제 가능

![/assets/img/discover6.png](/assets/img/discover6.png)

# 필터로 필터링

## 필터 추가

- 필터링할 필드를 클릭하면 아래와 같이 상위 5개의 값, 값의 비율, 문서수 나옴
- + 버튼을 누르면 해당 값이 포함된 문서만 조회되고 - 버튼을 누르면 해당 값이 포함되지 않은 문서만 조회됨
- 

![/assets/img/discover7.png](/assets/img/discover7.png)

## 조건으로 필터링

1. `Add Filter` 클릭
2. 필드 선택
3. 필터의 작업 선택
    - `is` : 필드 값이 주어진 값과 일치
    - `is not` : 필드 값이 주어진 값과 일치하지 않음
    - `is one of` : 필드가 지정된 값 중 하나와 일치
    - `is not one of` : 필드 값이 지정된 값과 일치하지 않음
    - `is between` : 필드 값이 주어진 범위에 있음
    - `is not between` : 필드 값이 주어진 범위에 없음
    - `exists` : 필드에 대한 값이 존재
    - `does not exist` : 필드에 대한 값이 존재하지 않음
4. 필터 값을 선택
5. 필터 레이블 지정(선택)
6. 저장하여 검색에 필터 적용

![/assets/img/discover8.png](/assets/img/discover8.png)

## 필터 편집, 비활성화, 삭제

![/assets/img/discover9.png](/assets/img/discover9.png)

## 필터 쿼리 직접 수정

`특정 필터 선택>Edit Filter>Edit as Query DSL` 에서 쿼리 직접 수정 가능

![/assets/img/discover10.png](/assets/img/discover10.png)

# 문서 데이터 보기

1. 필드열 추가 : `Available fields`에 마우스를 가져다 대면 `Add` 버튼으로 필드열을 추가할 수 있음
2. 정렬 순서 변경 :  정렬을 원하는 필드명 위에 마우스를 대면 위아래 방향 화살표 모양의 버튼이 나옴. 이 버튼을 클릭하면 첫 클릭시 오름차순, 두번째 클릭시 내림차순, 세번째 클릭시 정렬 필드에서 삭제
3. 필드열 이동 : 필드열의 순서를 바꿀 수 있는 좌우 화살표 버튼
4. 필드열 제거 : 필드열을 제거할 수 있는 X 버튼
5. 세부 정보 확인 : 각 열의 `>` 버튼을 누르면 아래와 같이 Table이나 JSON에 대한 세부정보를 확인할 수 있음

![/assets/img/discover11.png](/assets/img/discover11.png)

# 컨텍스트에서 문서보기

- 시간 기반 이벤트가 포함된 문서에서만 사용 가능
- 확장 아이콘 `>` 클릭 후 `View surrounding documents` 에 들어가면 아래와 같은 화면 확인 가능
- `Load` 버튼을 누를 때마다 5개씩 문서 추가 로드

![/assets/img/discover12.png](/assets/img/discover12.png)
