---
title: 쿠버네티스(kubernetes)란 무엇인가?
layout: post
date: '2020-09-10 17:58:00 +0300'
description: 쿠버네티스는 컨테이너화된 워크로드와 서비스를 관리하기 위한 이식성이 있고 확장가능한 오픈소스 플랫폼
img: null
fig-caption: null
tags:
- kubernetes
- 쿠버네티스
---

- 쿠버네티스는 컨테이너화된 워크로드와 서비스를 관리하기 위한 이식성이 있고 확장가능한 오픈소스 플랫폼

# 여정 돌아보기

- 전통적인 배포 시대 : 여러 물리 서버에서 각 애플리케이션을 실행
- 가상화된 배포 시대 : 단일 물리 서버에서 VM간의 애플리케이션 격리 실행
- 컨테이너 개발 시대 : VM과 유사하지만 격리 속성을 완화하여 운영체제를 공유 (클라우드나 OS 배포본에 모두 이식 가능)

# 쿠버네티스의 필요성

- 분산 시스템을 탄력적으로 실행하기 위한 프레임워크로 애플리케이션의 확장과 장애 조치를 처리하고, 배포 패턴 등을 제공
ex) 컨테이너가 다운되면 다른 컨테이너를 다시 시작

# 쿠버네티스의 기능

- `서비스 디스커버리와 로드 밸런싱` : DND 이름 사용하거나 자체 IP 주소 사용하여 컨테이너 노출 가능, 네트워크 트래픽을 로드 밸렁신하고 배포함
- `스토리지 오케스트레이션` : 원하는 저장소 시스템을 자동으로 탑재 가능
- `자동화된 롤아웃과 롤백` : 배포된 컨테이너의 원하는 상태 서술가능, 설정한 속도에 따라 변경 가능
- `자동화된 빈 패킹(bin packing)` : 컨테이너를 노드에 맞추어서 리소스를 잘 사용할 수 있도록 해줌
- `자동화된 복구(self-healing)` : 실패한 컨테이너 다시 시작, 교체, 응답하지 않는 컨테이너 죽임
- `시크릿과 구성 관리` : 암호, OAuth 토큰 및 SSH 키와 같은 중요 정보 저장 관리 가능

# 쿠버네티스가 아닌 것

- 모든 것이 포함된 PaaS(Platform as a Service)가 아님
- 모놀리식이 아니어서 기본 솔루션이 선택적 (사용자의 선택권과 유연성을 지켜줌)
1. 지원하는 애플리케이션의 유형을 제약하지 않는다.
2. 소스 코드를 배포하지 않으며 애플리케이션을 빌드하지 않는다.
3. 애플리케이션 레벨의 서비스를 제공하지 않는다.
4. 로깅, 모니터링 또는 경보 솔루션을 포함하지 않는다.
5. 기본 설정 언어/시스템(예, Jsonnet)을 제공하거나 요구하지 않는다.
6. 포괄적인 머신 설정, 유지보수, 관리, 자동 복구 시스템을 제공하거나 채택하지 않는다.
7. 쿠버네티스는 단순한 오케스트레이션 시스템이 아니다.

# 쿠버네티스 컴포넌트

## 쿠버네티스 클러스터

- 쿠버네티스 클러스터는 컨테이너화된 애플리케이션을 실행하는 노드라고 하는 워커 머신의 집합 (모든 클러스터는 최소 한개 이상의 워커 노드를 가짐)
- 워커 노드는 애플리케이션의 구성요소인 파드를 이끔(호스트 함)
- 컨트롤 플레인은 워커 노드와 클러스터 내 파드를 관리

## 컨트롤 플레인 컴포넌트

- 컨트롤 플레인 컴포넌트는 클러스터에 관한 전반적인 결정(스케줄링 등)을 수행하고 클러스터 이벤트를 감지하고 반응
1. kube-apiserver : API 서버는 쿠버네티스 API를 노출하는 쿠버네티스 컨트롤 플레인 컴포넌트
2. etcd : 모든 클러스터 데이터를 담는 쿠버네티스 뒷단의 저장소
3. kube-scheduler : 노드가 배정되지 않은 새로 생성된 파드 를 감지하고, 실행할 노드를 선택하는 컨트롤 플레인 컴포넌트
4. kube-controller-manage : 컨트롤러를 구동하는 마스터 상의 컴포넌트
5. cloud-controller-manager : 클라우드별 컨트롤 로직을 포함하는 쿠버네티스 컨트롤 플레인 컴포넌트

## 노드 컴포넌트

- 동작 중인 파드를 유지시키고 쿠버네티스 런타임 환경을 제공하며, 모든 노드 상에서 동작
1. kubelet : 클러스터의 각 노드에서 실행되는 에이전트
2. kube-proxy : 클러스터의 각 노드에서 실행되는 네트워크 프록시
3. 컨테이너 런타임 : 컨테이너 실행을 담당하는 소프트웨어

## 애드온

- 애드온은 쿠버네티스 리소스(데몬셋, 디플로이먼트 등)를 이용하여 클러스터 기능을 구현
1. DNS : 쿠버네티스 서비스를 위해 DNS 레코드를 제공해주는 DNS 서버
2. 웹 UI (대시보드) : 쿠버네티스 클러스터를 위한 범용의 웹 기반 UI
3. 컨테이너 리소스 모니터링 : 중앙 데이터베이스 내의 컨테이너들에 대한 포괄적인 시계열 매트릭스를 기록하고 그 데이터를 열람하기 위한 UI를 제공
4. 클러스터 레벨 로깅 : 중앙 로그 저장소에 컨테이너 로그를 저장하는 책임을 짐

# 쿠버네티스 API

- 최종 사용자, 클러스터의 다른 부분 그리고 외부 컴포넌트가 서로 통신할 수 있도록 HTTP API를 제공

## API 변경

- API를 지속적으로 변경하고 성장시킬 수 있는 디자인 기능 보유
- 프로젝트의 호환성을 유지하는 것을 목표로 함

## OpenAPI 명세

- OpenAPI를 활용해서 문서화

## API 버전 규칙

- `/api/v1`이나 `/apis/rbac.authorization.k8s.io/v1alpha1`과 같이 각각 다른 API 경로에서 복수의 API 버전을 지원
- `알파(Alpha)`, `베타(beta)`, `안정화(stable)` 수준의 버전이 있다.

## API 그룹

- 쉽게 확장하기 위해서 API 그룹을 구현 (REST 경로와 직렬화된 객체의 apiVersion 필드에 명시)

## API 그룹 활성화 또는 비활성화 하기

- `kube-apiserver`에서 커맨드 라인 옵션으로 `--runtime-config` 를 설정해서 활성화하거나 비활성화

## 지속성

- API 리소스에 대한 직렬화된 상태를 etcd에 기록하고 저장

# 쿠버네티스 오브젝트 이해

- 쿠버네티스 시스템에서 영속성을 가지는 개체
- 클러스터의 상태를 나타내기 위해 이용
- 동작시키려면 쿠버네티스 API를 이용해야 함

## 오브젝트 spec과 status

- `spac` : 오브젝트를 생성할 때 리소스의 원하는 특징을 설명
- `status` : 쿠버네티스 시스템과 컴포넌트에 의해 제공되고 업데이트 된 오브젝트의 현재 상태를 설명

## 쿠버네티스 오브젝트 기술하기

- `apiVersion` : 오브젝트를 생성하기 위해 사용하고 있는 쿠버네티스 API 버전
- `kind` : 어떤 종류의 오브젝트를 생성하고자 하는지
- `metadata` : 이름, 문자열, UID, 네임스페이스를 포함하여 오브젝트를 구분지어 줄 데이터
- `spec` : 오브젝트에 대해 어떤 상태를 의도하는지

```yaml
apiVersion: apps/v1 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2 # tells deployment to run 2 pods matching the template
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

### .yaml 파일을 이용하여 디플로먼트 생성하는 방식

- `kubectl apply` 커맨드 이용

```bash
kubectl apply -f https://k8s.io/examples/application/deployment.yaml --record
```

# 쿠버네티스 오브젝트 관리

## 관리 기법

- 명령형 커맨드 : 활성 오브젝트를 커맨드로 관리

```bash
## nginx 컨테이너의 인스턴스를 구동
kubectl create deployment nginx --image nginx
```

- 명령형 오브젝트 구성 : 개별 파일로 관리

```bash
## 구성파일에 정의된 오브젝트 생성
kubectl create -f nginx.yaml
## 구성파일에 정의된 오브젝트 삭제
kubectl delete -f nginx.yaml -f redis.yaml
## 구성을 덮어씀으로써 구성파일에 정의된 오브젝트를 업데이트
kubectl replace -f nginx.yaml
```

- 선언형 오브젝트 구성 : 파일이 있는 디렉터리로 관리

```bash
## 디렉터리 내 모든 오브젝트 구성파일을 처리하고 활성 오브젝트를 생성 또는 패치
kubectl diff -f configs/
kubectl apply -f configs/

## 재귀적으로 디렉터리를 처리
kubectl diff -R -f configs/
kubectl apply -R -f configs/
```

# 오브젝트 이름과 ID

## 이름

- DNS 서브도메인 이름
- DNS 레이블 이름
- 경로 세그먼트 이름

## UID

- 오브젝트를 중복 없이 식별하기 위해 쿠버네티스 시스템이 생성하는 문자열
- 모든 오브젝트는 서로 구분되는 UID를 가짐

# 네임스페이스

- 가상 클러스터를 네임스페이스라고 함

## 여러 개의 네임스페이스 사용

- 사용자가 거의 없거나 적을 때는 네임스페이스를 고려할 필요 없음
- 클러스터 자원을 여러 사용자 사이에서 나누는 방법
- 네임스페이스의 오브젝트는 동일한 접근 제어 정책을 가짐
- 리소스를 구별하기 위해 레이블 사용

## 네임스페이스 다루기

### 네임스페이스 조회

- 사용 중인 클러스터의 현재 네임스페이스 나열

```bash
kubectl get namespace

NAME              STATUS   AGE
## 다른 네임스페이스가 없는 오브젝트를 위한 기본 네임스페이스
default           Active   1d
## 쿠버네티스 시스템에서 생성한 오브젝트를 위한 네임스페이스
kube-node-lease   Active   1d
## 자동으로 생성되며, 모든 사용자가 읽기 권한으로 접근 가능
kube-public       Active   1d
## 클러스터가 스케일링될 때 노드 하트비트 성능을 향상 시키는 각 노드와 관련된 리스 오브젝트에 대한 네임스페이스
kube-system       Active   1d
```

### 요청에 네임스페이스 설정

- 현재 요청에 대한 네임스페이스 설정 : `--namespace` 플래그 사용

```bash
kubectl run nginx --image=nginx --namespace=<insert-namespace-name-here>
kubectl get pods --namespace=<insert-namespace-name-here>
```

### 선호하는 네임스페이스 설정

```bash
kubectl config set-context --current --namespace=<insert-namespace-name-here>
# 확인하기
kubectl config view --minify | grep namespace:
```

## 네임스페이스와 DNS

- 서비스를 생성하면 `<서비스-이름>.<네임스페이스-이름>.svc.cluster.local` 형식의 엔트리 생성
- 개발, 스테이징, 운영과 같이 여러 네임스페이스 내에서 동일한 설정을 사용하는 경우에 유용

# 레이블과 셀렉터

- 레이블 : 파드와 같은 오브젝트에 첨부된 키와 값의 쌍

```json
"metadata": {
  "labels": {
    "key1" : "value1",
    "key2" : "value2"
  }
}
```

- 레이블 셀렉터 : 클라이언트와 사용자는 오브젝트를 식별 (레이블은 이름과 UID처럼 고유하지 않음)

# 어노테이션

- 임의의 비-식별 메타데이터를 오브젝트에 첨부가능
- 어노테이션은 레이블과 같이 키/값 맵

```json
"metadata": {
  "annotations": {
    "key1" : "value1",
    "key2" : "value2"
  }
}
```

# 필드 셀렉터

- 쿠버네티스 리소스를 선택하기 위해 사용
    - `metadata.name=my-service`
    - `metadata.namespace!=default`
    - `status.phase=Pending`

```bash
## status.phase 필드의 값이 Running 인 모든 파드를 선택
kubectl get pods --field-selector status.phase=Running

## 사용할 수 없는 필드 셀렉터를 사용할 경우
kubectl get ingress --field-selector foo.bar=baz
Error from server (BadRequest): Unable to find "ingresses" that match label selector "", field selector "foo.bar=baz": "foo.bar" is not a known field selector: only "metadata.name", "metadata.namespace"

## =, ==, != 연산자 사용가능
## 디폴트 네임스페이스에 속해있지 않은 모든 쿠버네티스 서비스를 선택
kubectl get services  --all-namespaces --field-selector metadata.namespace!=default

## 필드 셀렉터를 연계해서 사용
## status.phase 필드가 Running이 아니고 spec.restartPolicy 필드가 Always인 모든 파드 선택
kubectl get pods --field-selector=status.phase!=Running,spec.restartPolicy=Always

## 여러개의 리소스 종류에서 사용
## 디폴트 네임스페이스에 속해있지 않은 모든 스테이트풀센과 서비스를 선택
kubectl get statefulsets,services --all-namespaces --field-selector metadata.namespace!=default
```

# 권장 레이블

- 지원 도구 외에도 쿼리하는 방식으로 애플리케이션을 식별

```bash
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app.kubernetes.io/name: mysql
    app.kubernetes.io/instance: mysql-abcxzy
    app.kubernetes.io/version: "5.7.21"
    app.kubernetes.io/component: database
    app.kubernetes.io/part-of: wordpress
    app.kubernetes.io/managed-by: helm
```

### ※ 용어 정리

`서비스 디스커버리(Service discovery)` : 서비스 검색은 컴퓨터 네트워크에서 이러한 장치가 제공하는 장치 및 서비스를 자동으로 감지하는 것

`로드 밸런싱(Load balancing)` : 둘 혹은 셋이상의 중앙처리장치 혹은 저장장치와 같은 컴퓨터 자원들에게 작업을 나누는 것

`워크로드` : 워크로드란 고객 대면 애플리케이션이나 백엔드 프로세스 같이 비즈니스 가치를 창출하는 리소스 및 코드 모음

`파드(Pod)` : 쿠버네티스에서 생성하고 관리할 수 있는 배포 가능한 가장 작은 컴퓨팅 단위

`노드` : 쿠버네티스의 작업 장비(worker machine)

`컨트롤 플레인(Control Plane)` : 컨테이너의 라이프사이클을 정의, 배포, 관리하기 위한 API와 인터페이스들을 노출하는 컨테이너 오케스트레이션 레이어

`데몬셋` : 파드의 복제본을 클러스터 노드 집합에서 동작하게 한다.

`디플로이먼트` : 클러스터에서 복제된 애플리케이션을 관리한다.

`엔드포인트` : 엔드 포인트 보안 또는 엔드 포인트 보호는 클라이언트 장치에 원격으로 브리지 된 컴퓨터 네트워크를 보호하는 접근 방식

`etcd` : 모든 클러스터 데이터를 담는 쿠버네티스 뒷단의 저장소

`레이블` : 파드와 같은 오브젝트에 첨부된 키와 값의 쌍
