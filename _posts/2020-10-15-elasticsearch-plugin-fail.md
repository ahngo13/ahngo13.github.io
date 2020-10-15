---
title: ElasticSearch 한글 형태소 분석기 은전한닢 플러그인 설치 그리고 실습 실패
layout: post
date: '2020-10-15 18:00:00 +0300'
description: ElasticSearch 한글 형태소 분석기 은전한닢 플러그인 설치 그리고 실습 실패
img: null
fig-caption: null
tags:
- es
- elasticsearch
- 은전한닢
- 은전한닢플러그인
- 엘라스틱서치
- 엘라스틱서치한글형태소분석기
---

# 실습 환경

- OS : CentOS 7
- docker-compose
- 3 node

# 형태소 분석

- 한글 문장에서 의미가 있는 최소 단위를 분석하는 것

# docker-compose.yml 파일 작성

- 아래와 같은 소스가 설정파일에 있다면 과감하게 변경해 바란다. 아래의 환경설정은 엘라스틱 서치 7버전 이후에 사용가능한 환경설정이라고 한다. 그래서 필자의 경우 컨테이너를 띄울 때마다 에러가 발생했었다. 6버전 이하의 엘라스틱 버전에서는 아래와 같이 변경해줘야 해당하는 오류가 발생하지 않는다.

`- discovery.seed_hosts=es02,es03` ⇒ `discovery.zen.ping.unicast.hosts=es02,es03`
`- cluster.initial_master_nodes=es01,es02,es03` ⇒ `discovery.zen.minimum_master_nodes=2`

`- "ES_JAVA_OPTS=-Xms512m -Xmx512m"` ⇒ `- "ES_JAVA_OPTS=-Xms2g -Xmx2g"`,  `- "ES_JAVA_OPTS=-Xms4000m -Xmx4000m"`

`xpack.security.enabled=false` 추가

```bash
version: '2.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:6.7.1
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.zen.ping.unicast.hosts=es02,es03
      - discovery.zen.minimum_master_nodes=2
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - "ES_JAVA_OPTS=-Xms4000m -Xmx4000m"
      - xpack.security.enabled=false
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
    image: docker.elastic.co/elasticsearch/elasticsearch:6.7.1
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.zen.ping.unicast.hosts=es01,es03
      - discovery.zen.minimum_master_nodes=2
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - "ES_JAVA_OPTS=-Xms4000m -Xmx4000m"
      - xpack.security.enabled=false
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
    image: docker.elastic.co/elasticsearch/elasticsearch:6.7.1
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.zen.ping.unicast.hosts=es01,es02
      - discovery.zen.minimum_master_nodes=2
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
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
    image: docker.elastic.co/kibana/kibana:6.7.1
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

# 은전한닢 형태소 분석기 다운로드 및 설치

- 공식 사이트에서 다운받고 싶었으나 적용이 잘 안되는 관계로 아래의 경로를 통해 설치하였다.

[`https://raw.githubusercontent.com/javacafe-project/elastic-book-etc/master/plugin/elasticsearch-analysis-seunjeon-6.7.1.zip`](https://raw.githubusercontent.com/javacafe-project/elastic-book-etc/master/plugin/elasticsearch-analysis-seunjeon-6.7.1.zip)

```bash
## 백그라운드에서 컨테이너들 띄우기
docker-compose up -d

## 엘라스틱 서치 노드에 접속
[root@node1 es]# docker exec -it es01 bash

## 은전한닢 플러그인 설치
[root@1cec75606214 elasticsearch]# ./bin/elasticsearch-plugin install https://raw.githubusercontent.com/javacafe-project/elastic-book-etc/master/plugin/elasticsearch-analysis-seunjeon-6.7.1.zip
[=================================================] 100%??
-> Installed analysis-seunjeon
[root@1cec75606214 elasticsearch]# cd bin
[root@1cec75606214 bin]# ls
elasticsearch               elasticsearch-keystore           elasticsearch-setup-passwords      elasticsearch.bat
elasticsearch-certgen       elasticsearch-keystore.bat       elasticsearch-setup-passwords.bat  x-pack
elasticsearch-certgen.bat   elasticsearch-migrate            elasticsearch-sql-cli              x-pack-env
elasticsearch-certutil      elasticsearch-migrate.bat        elasticsearch-sql-cli-6.4.3.jar    x-pack-env.bat
elasticsearch-certutil.bat  elasticsearch-plugin             elasticsearch-sql-cli.bat          x-pack-security-env
elasticsearch-cli           elasticsearch-plugin.bat         elasticsearch-syskeygen            x-pack-security-env.bat
elasticsearch-cli.bat       elasticsearch-saml-metadata      elasticsearch-syskeygen.bat        x-pack-watcher-env
elasticsearch-croneval      elasticsearch-saml-metadata.bat  elasticsearch-translog             x-pack-watcher-env.bat
elasticsearch-croneval.bat  elasticsearch-service-mgr.exe    elasticsearch-translog.bat
elasticsearch-env           elasticsearch-service-x64.exe    elasticsearch-users
elasticsearch-env.bat       elasticsearch-service.bat        elasticsearch-users.bat

## 플러그인이 잘 설치되었는지 확인
[root@1cec75606214 bin]# elasticsearch-plugin list
analysis-seunjeon

[root@1cec75606214 bin]# exit
exit

## 다른 노드들에도 설치를 진행해준다
[root@node1 es]# docker exec -it es02 bash
[root@9b89ab54ad2f elasticsearch]# ./bin/elasticsearch-plugin install https://raw.githubusercontent.com/javacafe-project/elastic-book-etc/master/plugin/elasticsearch-analysis-seunjeon-6.7.1.zip
[=================================================] 100%??
-> Installed analysis-seunjeon
[root@9b89ab54ad2f elasticsearch]# exit
exit
[root@node1 es]# docker exec -it es03 bash
[root@83fa897e43dc elasticsearch]# ./bin/elasticsearch-plugin install https://raw.githubusercontent.com/javacafe-project/elastic-book-etc/master/plugin/elasticsearch-analysis-seunjeon-6.7.1.zip
[=================================================] 100%??

## 플러그인을 인식시키기 위해 재시작 해준다
[root@node1 es]# docker-compose stop
Stopping es02  ... done
Stopping es01  ... done
Stopping es03  ... done
Stopping kib01 ... done
[root@node1 es]# docker-compose start
Starting es01  ... done
Starting es02  ... done
Starting es03  ... done
Starting kib01 ... done
```

[34일차(10/14) (수)](https://www.notion.so/34-10-14-d3598aea499d438c8f0b27f1bdfd5d3e)

혹시나 `docker-compose start`를 했을 때 인덱스 관련 에러가 뜬다면 기존에 생성된 인덱스가 깨졌거나 충돌이 되어 그럴 수 있으므로 모두 삭제해준다. 필자의 경우 해당 경로에 볼륨이 추가되어있었으므로 아래와 같이 삭제하였다.

```bash
[root@node1 ES]# rm -rf /var/lib/docker/volumes/es_data01/_data/nodes/
[root@node1 ES]# rm -rf /var/lib/docker/volumes/es_data02/_data/nodes/
[root@node1 ES]# rm -rf /var/lib/docker/volumes/es_data02/_data/nodes/
```

# 은전한닢 형태소 분석기 실습

필자가 올린 여러가지 시행착오는 버전을 이걸로도 해보고 저걸로도 해보고 다운을 받아서 설치도해보고 압축을 풀어서 옮겨서 설치도 해보고 여러가지 환경변수로 변경해서 실행시켜보고 다양한 방법을 시도한 것이다. 엘라스틱 서치에서 제공하는 공식 플러그인이 생기면서 관리가 소홀해진건지 변경된 부분이 많아서 아리랑도 그렇고 설치하는데에도 꽤나 애를 먹었다. 아래와 같은 명령어를 해서 요청 보내는 것은 성공했으나 그 이외의 쿼리를 요청했을 때 또 다른 에러가 발생하는 것을 확인할 수 있었다. 불안감을 품고 계속해서 실습을 진행할 수 없었으므로 여기에서 멈추기로 하였다.

```bash
# 요청
PUT /seunjeon_default_analyzer
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1,
    "index": {
      "analysis": {
        "analyzer": {
          "korean": {
            "type": "custom",
            "tokenizer": "seunjeon_default_tokenizer"
          }
        },
        "tokenizer": {
          "seunjeon_default_tokenizer": {
            "type": "seunjeon_tokenizer",
            "index_eojeol": false,
            "user_words": [
              "낄끼+빠빠,-100", "c\\+\\+", "어그로", "버카충", "abc마트"
            ]
          }
        }
      }
    }
  }
}

# 결과
{
    "acknowledged": true,
    "shards_acknowledged": true,
    "index": "seunjeon_default_analyzer"
}
```

마지막 오류

```bash
[2020-10-15T05:06:50,132][ERROR][o.e.b.ElasticsearchUncaughtExceptionHandler] [es01] fatal error in thread [elasticsearch[es01][analyze][T#1]], exiting
java.lang.NoClassDefFoundError: org/elasticsearch/common/logging/ESLoggerFactory
        at org.bitbucket.eunjeon.seunjeon.elasticsearch.SeunjeonTokenizer.<init>(SeunjeonTokenizer.java:31) ~[?:?]
        at org.bitbucket.eunjeon.seunjeon.elasticsearch.index.analysis.SeunjeonTokenizerFactory.create(SeunjeonTokenizerFactory.java:49) ~[?:?]
        at org.elasticsearch.index.analysis.CustomAnalyzer.createComponents(CustomAnalyzer.java:89) ~[elasticsearch-6.7.1.jar:6.7.1]
        at org.apache.lucene.analysis.AnalyzerWrapper.createComponents(AnalyzerWrapper.java:136) ~[lucene-core-7.7.0.jar:7.7.0 8c831daf4eb41153c25ddb152501ab5bae3ea3d5 - jimczi - 2019-02-04 23:16:28]
        at org.apache.lucene.analysis.Analyzer.tokenStream(Analyzer.java:198) ~[lucene-core-7.7.0.jar:7.7.0 8c831daf4eb41153c25ddb152501ab5bae3ea3d5 - jimczi - 2019-02-04 23:16:28]
        at org.elasticsearch.action.admin.indices.analyze.TransportAnalyzeAction.simpleAnalyze(TransportAnalyzeAction.java:267) ~[elasticsearch-6.7.1.jar:6.7.1]
        at org.elasticsearch.action.admin.indices.analyze.TransportAnalyzeAction.analyze(TransportAnalyzeAction.java:252) ~[elasticsearch-6.7.1.jar:6.7.1]
        at org.elasticsearch.action.admin.indices.analyze.TransportAnalyzeAction.shardOperation(TransportAnalyzeAction.java:170) ~[elasticsearch-6.7.1.jar:6.7.1]
        at org.elasticsearch.action.admin.indices.analyze.TransportAnalyzeAction.shardOperation(TransportAnalyzeAction.java:81) ~[elasticsearch-6.7.1.jar:6.7.1]
        at org.elasticsearch.action.support.single.shard.TransportSingleShardAction$1.doRun(TransportSingleShardAction.java:115) ~[elasticsearch-6.7.1.jar:6.7.1]
        at org.elasticsearch.common.util.concurrent.ThreadContext$ContextPreservingAbstractRunnable.doRun(ThreadContext.java:751) ~[elasticsearch-6.7.1.jar:6.7.1]
        at org.elasticsearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:37) ~[elasticsearch-6.7.1.jar:6.7.1]
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) ~[?:?]
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) ~[?:?]
        at java.lang.Thread.run(Thread.java:835) [?:?]
Caused by: java.lang.ClassNotFoundException: org.elasticsearch.common.logging.ESLoggerFactory
        at java.net.URLClassLoader.findClass(URLClassLoader.java:436) ~[?:?]
        at java.lang.ClassLoader.loadClass(ClassLoader.java:588) ~[?:?]
        at java.net.FactoryURLClassLoader.loadClass(URLClassLoader.java:864) ~[?:?]
        at java.lang.ClassLoader.loadClass(ClassLoader.java:521) ~[?:?]
        ... 15 more
```

컴퓨터 사양 때문에 안되는 건가라는 생각도 들었다. 의외로 메모리와 CPU를 많이 잡아먹는 것 같다.

![/assets/img/2020-10-15_19h38_40.png](/assets/img/2020-10-15_19h38_40.png)
