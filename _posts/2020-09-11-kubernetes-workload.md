---
title: 쿠버네티스 워크로드(파드, 레플리카셋, 디플로이먼트, 스테이트풀셋, 데몬셋) 실습
layout: post
date: '2020-09-11 17:58:00 +0300'
description: 쿠버네티스는 컨테이너화된 워크로드와 서비스를 관리하기 위한 이식성이 있고 확장가능한 오픈소스 플랫폼
img: null
fig-caption: null
tags:
- kubernetes
- 쿠버네티스
- kubernetesworkload
- 쿠버네티스워크로드
- 파드
- 레플리카셋
- 디플로이먼트
- 스테이트풀셋
- 데몬셋
---

# 파드(Pod)

- 컨테이너가 모인 집합체의 단위, 적어도 하나 이상의 컨테이너로 이루어짐
- Nginx 컨테이너와 Go 애플리케이션 컨테이너 처럼 강한 결합을 유지하는 쪽이 나은 경우 파드로 묶어서 일괄 배포 (컨테이너가 하나인 경우에도 파드로 배포)

## 파드 생성 및 배포

- `apiVersion` : 사용할 k8s API의 버전 명세 (apps/v1 이런 식으로 API 그룹명을 명세해야 하는 경우eh 있음)
- `kind` : 리소스 타입
- `metadata` :  name과 label을 정의
    - `name` : 동일한 namespace 상에서는 유일한 값의 이름
    - `label` : 특정 k8s object만을 나열한다거나 검색할 때 유용하게 쓰일 수 있는 key-value 쌍
- `spec` : pod의 구체적인 내용을 정의
    - `containers` : 1개 이상의 컨테이너를 정의
        - `name` : 동일한 pod 내에서 유일한 이름
        - `image` : docker image
        - `commend` : container가 생성된 초기에 실행되는 명령이나 스크립트 수록

```bash
## 테스트를 위해 podtest라는 폴더를 생성
[root@node1 ~]# mkdir podtest

## podtest 폴더로 이동
[root@node1 ~]# cd podtest/

## Pod yaml 파일 작성
[root@node1 podtest]# vi pod-template.yaml

## pod-template.yaml 파일 내용
apiVersion: v1
kind: Pod
metadata:
 name: myapp-pod
 labels:
   app: myapp
spec:
 containers:
 - name: myapp-container
   image: busybox
   command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']

## pod 생성 및 배포
[root@node1 podtest]# kubectl apply -f pod-template.yaml
```

## 배포된 파드 확인

- `kubectl get pods`

```bash
[root@node1 podtest]# kubectl get pods
NAME        READY   STATUS              RESTARTS   AGE
myapp-pod   0/1     ContainerCreating   0          19s
```

## 파드의 로그 확인

- `kubectl logs pod/[파드 이름]`

```bash
[root@node1 podtest]# kubectl logs pod/myapp-pod
Hello Kubernetes!
```

## 파드의 컨테이너 접속

- `kubectl exec -it [파드 이름] -- /bin/sh`

```bash
[root@node1 podtest]# kubectl exec -it myapp-pod -- /bin/sh
/ # echo $HOSTNAME
myapp-pod
/ # ls
bin   dev   etc   home  proc  root  sys   tmp   usr   var
/ # exit
```

# 레플리카셋(ReplicaSet)

- 파드를 정의한 매니페스트 파일로는 파드를 하나밖에 생성할 수 없음
- 규모가 되는 애플리케이션을 구축하기 위해 같은 파드를 여러 개 실행해야 할 경우 사용
- 똑같은 정의를 갖는 파드를 여러 개 생성하고 관리하기 위한 리소스
- 파드의 정의도 레프리카세트 yaml 파일에 정의하므로 파드의 설정파일을 따로 둘 필요 없음

## 레플리카셋 생성 및 배포

```bash
## kubertest 폴더 생성
[root@node1 ~]# mkdir kubertest

## kubertest 폴더로 이동
[root@node1 ~]# cd kubertest/

## frontend.yaml 파일 생성
[root@node1 kubertest]# vi frontend.yaml

## frontend.yaml 파일 내용
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend
  labels:
    app: guestbook
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      tier: frontend
  template:
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: php-redis
        image: gcr.io/google_samples/gb-frontend:v3

## 레플리카셋 생성 및 배포
[root@node1 kubertest]# kubectl apply -f frontend.yaml
replicaset.apps/frontend created
```

## 배포된 레플리카셋 확인

- `kubectl get rs(=kubectl get ReplicaSet)`

```bash
[root@node1 kubertest]# kubectl get rs
NAME       DESIRED   CURRENT   READY   AGE
frontend   3         3         3       5m35s

[root@node1 kubertest]# kubectl get replicaset
NAME       DESIRED   CURRENT   READY   AGE
frontend   3         3         3       6m28s
```

## 레플리카셋 상태 확인

- `kubectl describe rs/[레플리카셋 이름]`

```bash
[root@node1 kubertest]# kubectl describe rs/frontend
Name:         frontend
Namespace:    default
Selector:     tier=frontend
Labels:       app=guestbook
              tier=frontend
Annotations:  <none>
Replicas:     3 current / 3 desired
Pods Status:  3 Running / 0 Waiting / 0 Succeeded / 0 Failed
Pod Template:
  Labels:  tier=frontend
  Containers:
   php-redis:
    Image:        gcr.io/google_samples/gb-frontend:v3
    Port:         <none>
    Host Port:    <none>
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Events:
  Type    Reason            Age   From                   Message
  ----    ------            ----  ----                   -------
  Normal  SuccessfulCreate  12m   replicaset-controller  Created pod: frontend-f8qbl
  Normal  SuccessfulCreate  12m   replicaset-controller  Created pod: frontend-bldg4
  Normal  SuccessfulCreate  12m   replicaset-controller  Created pod: frontend-tnthj
```

## 배포된 파드 확인

- `kubectl get pods`

```bash
[root@node1 kubertest]# kubectl get pods
NAME             READY   STATUS    RESTARTS   AGE
frontend-bldg4   1/1     Running   0          14m
frontend-f8qbl   1/1     Running   0          14m
frontend-tnthj   1/1     Running   0          14m
myapp-pod        1/1     Running   1          78m
```

## 실행 중인 파드 중 하나의 yaml 확인

- `kubectl get pods [파드의 이름] -o yaml`
- 레플리카셋의 정보 확인

```bash
[root@node1 kubertest]# kubectl get pods frontend-f8qbl -o yaml
...
ownerReferences:
  - apiVersion: apps/v1
    blockOwnerDeletion: true
    controller: true
    kind: ReplicaSet
    name: frontend
    uid: e687f21a-17d3-4ed7-8250-52a10078a8c8
  resourceVersion: "167049"
  selfLink: /api/v1/namespaces/default/pods/frontend-f8qbl
  uid: 3ae7c0fa-ecff-4ce9-adc5-9f5b6f2166b3
...
```

## 템플릿을 사용하지 않는 파드의 획득

- 단독 파드가 레플리카셋의 셀렉터와 일치하는 레이블을 가지지 않도록 하는 것을 강력하게 권장함 (레플리카셋이 소유하는 파드가 템플릿에 명시된 파드에만 국한되지 않고, 이전 섹션에서 명시된 방식에 의해서도 다른 파드의 획득이 가능하기 때문)

```bash
## 레플리카셋의 셀렉터와 일치하는 레이블의 pod 생성을 위한 yaml 파일 작성
[root@node1 kubertest]# vi pod-rs.yaml

## pod-rs 파일 내용
apiVersion: v1
kind: Pod
metadata:
  name: pod1
  labels:
    tier: frontend
spec:
  containers:
  - name: hello1
    image: gcr.io/google-samples/hello-app:2.0

---

apiVersion: v1
kind: Pod
metadata:
  name: pod2
  labels:
    tier: frontend
spec:
  containers:
  - name: hello2
    image: gcr.io/google-samples/hello-app:1.0

## 파드 생성 및 배포
[root@node1 kubertest]# kubectl apply -f pod-rs.yaml
pod/pod1 created
pod/pod2 created

## 배포된 파드 확인
[root@node1 kubertest]# kubectl get pods
NAME             READY   STATUS        RESTARTS   AGE
frontend-bldg4   1/1     Running       0          58m
frontend-f8qbl   1/1     Running       0          58m
frontend-tnthj   1/1     Running       0          58m
myapp-pod        1/1     Running       2          123m
pod1             0/1     Terminating   0          8s
pod2             0/1     Terminating   0          8s

## frontend 파드 삭제
[root@node1 kubertest]# kubectl delete -f frontend.yaml

## pod-rs.yaml을 통한 pod 재생성 (종료되어서 없어졌을 수도 있어서 재생성)
[root@node1 kubertest]# kubectl apply -f pod-rs.yaml
pod/pod1 created
pod/pod2 created

## frontend.yaml을 통한 레플리카셋 재생성
[root@node1 kubertest]# kubectl apply -f frontend.yaml
replicaset.apps/frontend created

## 배포된 파드 확인 
## 레플리카셋 설정한 갯수 만큼만 pod가 생성되었음을 확인 가능
## 따라서 셀렉터와 일치하는 레이블을 만들면 문제가 생길 수도 있다
[root@node1 kubertest]# kubectl get pods
NAME             READY   STATUS              RESTARTS   AGE
frontend-jw2b4   1/1     Running             0          19s
myapp-pod        1/1     Running             2          127m
pod1             0/1     ContainerCreating   0          24s
pod2             1/1     Running             0          24s
```

## 레플리카셋 매니페스트 작성하기

- 레플리카셋은 모든 쿠버네티스 API 오브젝트와 마찬가지로 `apiVersion`, `kind`, `metadata` 필드가 필요
- 레플리카셋 오브젝트의 이름은 유효한 DNS 서브도메인 이름이어야 함

- frontend.yaml 예제 참조

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend
  labels:
    app: guestbook
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      tier: frontend
  template:
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: php-redis
        image: gcr.io/google_samples/gb-frontend:v3
```

### 파드 템플릿

- `.spec.template`은 레이블을 붙이도록 되어있는 파드 템플릿
- 이 파드를 다른 컨트롤러가 취하지 않도록 다른 컨트롤러의 셀렉터와 겹치지 않도록 주의

### 파드 셀렉터

- `.spec.selector` 필드는 레이블 셀렉터

### 레플리카

- `.spec.replicas`를 설정해서 동시에 동작하는 파드의 수를 지정
- `.spec.replicas`를 지정하지 않으면 기본값은 1

## 레플리카셋 작업

### 레플리카셋과 해당 파드 삭제

- 레플리카셋 및 모든 파드를 삭제하려면 `kubectl delete`를 사용[https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#delete](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#delete)
- REST API또는 client-go 라이브러리를 이용할 때는 -d 옵션으로 propagationPolicy를 Background또는 Foreground로 설정

```bash
kubectl delete -f frontend.yaml

kubectl proxy --port=8080
curl -X DELETE  'localhost:8080/apis/apps/v1/namespaces/default/replicasets/frontend' \
> -d '{"kind":"DeleteOptions","apiVersion":"v1","propagationPolicy":"Foreground"}' \
> -H "Content-Type: application/json"
```

### 레플리카셋만 삭제하기

- `-cascade=false` 옵션과 함께 `kubectl delete`를 사용하면 연관 파드에 영향을 주지 않고 삭제
- REST API 또는 client-go 라이브러리를 이용할 때는 propagationPolicy에 Orphan을 설정

```bash
[root@node1 kubertest]# kubectl delete pod pod1
pod "pod1" deleted

kubectl proxy --port=8080
curl -X DELETE  'localhost:8080/apis/apps/v1/namespaces/default/replicasets/frontend' \
> -d '{"kind":"DeleteOptions","apiVersion":"v1","propagationPolicy":"Orphan"}' \
> -H "Content-Type: application/json"
```

### 레플리카셋에서 파드 격리

- 레이블을 변경하면 레플리카셋에서 파드를 제거할 수 있다 (디버깅, 데이터 복구 등을 위해 사용)

### 레플리카셋의 스케일링

- 단순히 `.spec.replicas` 필드를 업데이트 하면 된다.

### 레플리카셋을 Horizontal Pod Autoscaler 대상으로 설정

```bash
## hpa-rs.yaml 파일 생성
[root@node1 kubertest]# vi hpa-rs.yaml

## hpa-rs.yaml 파일 내용
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-scaler
spec:
  scaleTargetRef:
    kind: ReplicaSet
    name: frontend
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 50

## HorizontalPodAutoscaler 적용
[root@node1 kubertest]# kubectl apply -f hpa-rs.yaml
horizontalpodautoscaler.autoscaling/frontend-scaler created

## 이러한 명령어로 편하게 작업 가능
[root@node1 kubertest]# kubectl autoscale rs frontend --max=10 --min=3 --cpu-percent=50
horizontalpodautoscaler.autoscaling/frontend autoscaled
```

# 디플로이먼트(권장)

- 레플리카셋을 소유하거나 업데이트를 하고, 파드의 선언적인 업데이트와 서버측 롤링 업데이트를 할 수 있는 오브젝트

## 기본 파드

- 사용자가 직접 파드를 생성하는 경우와는 다르게, 레플리카셋은 노드 장애 또는 노드의 커널 업그레이드와 같은 관리 목적의 중단 등 어떤 이유로든 종료되거나 삭제된 파드를 교체

## 잡

- 스스로 종료되는 것이 예상되는 파드의 경우에는 레플리카셋 대신 잡을 이용 (배치)

## 데몬셋

- 머신 모니터링 또는 머신 로깅과 같은 머신-레벨의 기능을 제공하는 파드를 위해서는 레플리카셋 대신 데몬셋을 사용
- 머신에서 다른 파드가 시작하기 전에 실행되어야 하며, 머신의 재부팅/종료가 준비되었을 때, 해당 파드를 종료하는 것이 안전

## 디플로이먼트 생성

```bash
## nginx-deployment.yaml 파일 생성
[root@node1 kubertest]# vi nginx-deployment.yaml

## nginx-deployment.yaml 파일 내용
apiVersion: apps/v1
kind: Deployment
metadata:
  ## nginx-deployment의 이름으로 디플로이먼트 생성
  name: nginx-deployment
  labels:
    app: nginx
spec:
  ## 3개의 레플리카 파드를 생성
  replicas: 3
  ## 플로이먼트가 관리할 파드를 찾는 방법을 정의 (app: nginx)
  selector:
    matchLabels:
      app: nginx
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

## 디플로이먼트 생성
[root@node1 kubertest]# kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment created

## 디플로이먼트 생성 확인
[root@node1 kubertest]# kubectl get deployments
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           27s

## 생성된 레플리카셋 확인
[root@node1 kubertest]# kubectl get rs
# NAME : 레플리카셋 이름 목록
# DESIRED : 디플로이먼트의 생성 시 정의된 의도한 애플리케이션 레플리카의 수를 표시
# CURRENT : 실행 중인 레플리카 수
# READY : 사용자가 사용할 수 있ㄴ느 레플리카의 수
# AGE : 실행된 시간 
NAME                          DESIRED   CURRENT   READY   AGE
frontend                      3         3         3       52m
nginx-deployment-66b6c48dd5   3         3         3       4m43s

## 자동으로 생성된 레이블 보기
[root@node1 kubertest]# kubectl get pods --show-labels
NAME                                READY   STATUS    RESTARTS   AGE     LABELS
frontend-jw2b4                      1/1     Running   0          55m     tier=frontend
frontend-mt8vl                      1/1     Running   0          38m     tier=frontend
frontend-wmhrv                      1/1     Running   0          38m     tier=frontend
myapp-pod                           1/1     Running   3          3h3m    app=myapp
nginx-deployment-66b6c48dd5-297dc   1/1     Running   0          7m59s   app=nginx,pod-template-hash=66b6c48dd5
nginx-deployment-66b6c48dd5-2w9b4   1/1     Running   0          7m59s   app=nginx,pod-template-hash=66b6c48dd5
nginx-deployment-66b6c48dd5-bkm22   1/1     Running   0          7m59s   app=nginx,pod-template-hash=66b6c48dd5
```

## 디플로이먼트 업데이트

- 디플로이먼트의 파드 템플릿(즉, `.spec.template`)이 변경된 경우에만 디플로이먼트의 롤아웃이 트리거(trigger) 된다.

- `nginx:1.14.2` 이미지 대신 `nginx:1.16.1` 이미지를 사용하도록 nginx 파드를 업데이트

```bash
[root@node1 kubertest]# kubectl --record deployment.apps/nginx-deployment set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1
deployment.apps/nginx-deployment image updated
deployment.apps/nginx-deployment image updated

## 더 간단한 명령어
[root@node1 kubertest]# kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record
deployment.apps/nginx-deployment image updated

## 또 다른 방법
# .spec.template.spec.containers[0].image 를 nginx:1.14.2 에서 nginx:1.16.1 로 변경
[root@node1 kubertest]# kubectl edit deployment.v1.apps/nginx-deployment

## 롤아웃 상태 확인
[root@node1 kubertest]# kubectl rollout status deployment.v1.apps/nginx-deployment
deployment "nginx-deployment" successfully rolled out

## 업데이트된 디플로이먼트 자세한 정보 보기
[root@node1 kubertest]# kubectl get deployments
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           23m

## 새 레플리카셋을 생성해서 파드를 업데이트 했고 
## 새 레플리카셋을 3개로 레플리카로 스케일업
## 이전 레플리카셋을 0개의 레플리카로 스케일다운
[root@node1 kubertest]# kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
frontend                      3         3         3       72m
nginx-deployment-559d658b74   3         3         3       8m14s
nginx-deployment-66b6c48dd5   0         0         0       24m

## 새 파트만 표시됨. (이전 것은 표시 안됨)
[root@node1 kubertest]# kubectl get pods
NAME                                READY   STATUS    RESTARTS   AGE
frontend-jw2b4                      1/1     Running   0          73m
frontend-mt8vl                      1/1     Running   0          56m
frontend-wmhrv                      1/1     Running   0          56m
myapp-pod                           1/1     Running   3          3h21m
nginx-deployment-559d658b74-8xj6q   1/1     Running   0          9m52s
nginx-deployment-559d658b74-bz75k   1/1     Running   0          9m42s
nginx-deployment-559d658b74-l76dc   1/1     Running   0          9m32s

## 디플로이먼트의 세부 정보 가져오기
[root@node1 kubertest]# kubectl describe deployments
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Fri, 11 Sep 2020 13:21:18 +0900
Labels:                 app=nginx
Annotations:            deployment.kubernetes.io/revision: 2
                        kubernetes.io/change-cause: kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record=true
Selector:               app=nginx
Replicas:               3 desired | 3 updated | 3 total | 3 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx
  Containers:
   nginx:
    Image:        nginx:1.16.1
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   nginx-deployment-559d658b74 (3/3 replicas created)

## 스케일업, 스케일다운한 이력들이 나옴
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  30m   deployment-controller  Scaled up replica set nginx-deployment-66b6c48dd5 to 3
  Normal  ScalingReplicaSet  13m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 1
  Normal  ScalingReplicaSet  13m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 2
  Normal  ScalingReplicaSet  13m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 2
  Normal  ScalingReplicaSet  13m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 1
  Normal  ScalingReplicaSet  13m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 3
  Normal  ScalingReplicaSet  13m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 0
```

### 롤오버 (인-플라이트 다중 업데이트)

- 기존 롤아웃이 진행되는 중에 디플로이먼트를 업데이트하는 경우 디플로이먼트가 업데이트에 따라 새 레플리카셋을 생성하고, 스케일 업하기 시작한다. 그리고 이전에 스케일 업 하던 레플리카셋에 롤오버 한다.
ex) 디플로이먼트로 nginx:1.14.2 레플리카를 5개 생성을 한다. 하지만 nginx:1.14.2 레플리카 3개가 생성되었을 때 디플로이먼트를 업데이트해서 nginx:1.16.1 레플리카 5개를 생성성하도록 업데이트를 한다고 가정한다. 이 경우 디플로이먼트는 즉시 생성된 3개의 nginx:1.14.2 파드 3개를 죽이기 시작하고 nginx:1.16.1 파드를 생성하기 시작한다. 이것은 과정이 변경되기 전 nginx:1.14.2 레플리카 5개가 생성되는 것을 기다리지 않는다.

### 레이블 셀렉터 업데이트

- 일반적으로 레이블 셀렉터를 업데이트 하는 것을 권장하지 않으며 셀렉터를 미리 계획하는 것을 권장

## 디플로이먼트 롤백

- 지속적인 충돌로 안정적이지 않은 경우. 기본적으로 모든 디플로이먼트의 롤아웃 기록은 시스템에 남아있어 언제든지 원할 때 롤백이 가능

```bash
## 이미지 이름을 nginx:1.16.1 이 아닌 nginx:1.161 로 입력해서 오타를 냈다고 가정
[root@node1 kubertest]# kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.161 --record=true
deployment.apps/nginx-deployment image updated

## 롤아웃 상태 확인
[root@node1 kubertest]# kubectl rollout status deployment.v1.apps/nginx-deployment
Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas have been updated...
^C

## 레플리카셋 확인
[root@node1 kubertest]# kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
frontend                      3         3         3       95m
nginx-deployment-559d658b74   3         3         3       31m
nginx-deployment-66b6c48dd5   0         0         0       47m
## 레플리카셋에 생성된 1개의 파드가 풀 루프에 고착됨
nginx-deployment-66bc5d6c8    1         1         0       30s 
[root@node1 kubertest]# kubectl get pods
NAME                                READY   STATUS         RESTARTS   AGE
frontend-jw2b4                      1/1     Running        0          95m
frontend-mt8vl                      1/1     Running        0          78m
frontend-wmhrv                      1/1     Running        0          79m
myapp-pod                           1/1     Running        3          3h43m
nginx-deployment-559d658b74-8xj6q   1/1     Running        0          32m
nginx-deployment-559d658b74-bz75k   1/1     Running        0          31m
nginx-deployment-559d658b74-l76dc   1/1     Running        0          31m
nginx-deployment-66bc5d6c8-kccs6    0/1     ErrImagePull   0          44s

[root@node1 kubertest]# kubectl describe deployment
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Fri, 11 Sep 2020 13:21:18 +0900
Labels:                 app=nginx
Annotations:            deployment.kubernetes.io/revision: 3
                        kubernetes.io/change-cause: kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.161 --record=true
Selector:               app=nginx
Replicas:               3 desired | 1 updated | 4 total | 3 available | 1 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx
  Containers:
   nginx:
    Image:        nginx:1.161
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    ReplicaSetUpdated
OldReplicaSets:  nginx-deployment-559d658b74 (3/3 replicas created)
NewReplicaSet:   nginx-deployment-66bc5d6c8 (1/1 replicas created)
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  48m   deployment-controller  Scaled up replica set nginx-deployment-66b6c48dd5 to 3
  Normal  ScalingReplicaSet  32m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 1
  Normal  ScalingReplicaSet  32m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 2
  Normal  ScalingReplicaSet  32m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 2
  Normal  ScalingReplicaSet  31m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 1
  Normal  ScalingReplicaSet  31m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 3
  Normal  ScalingReplicaSet  31m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 0
  Normal  ScalingReplicaSet  60s   deployment-controller  Scaled up replica set nginx-deployment-66bc5d6c8 to 1
```

### 디플로이먼트의 롤아웃 기록 확인

```bash
## 롤아웃 기록 확인
[root@node1 kubertest]# kubectl rollout history deployment.v1.apps/nginx-deployment
deployment.apps/nginx-deployment
REVISION  CHANGE-CAUSE
1         <none>
2         kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record=true
3         kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.161 --record=true

## 주석 달기
[root@node1 kubertest]# kubectl annotate deployment.v1.apps/nginx-deployment kubernetes.io/change-cause="image updated to 1.16.1"
deployment.apps/nginx-deployment annotated

## 각 수정 버전의 세부정보 확인
[root@node1 kubertest]# kubectl rollout history deployment.v1.apps/nginx-deployment --revision=2
deployment.apps/nginx-deployment with revision #2
Pod Template:
  Labels:       app=nginx
        pod-template-hash=559d658b74
  Annotations:  kubernetes.io/change-cause: kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record=true
  Containers:
   nginx:
    Image:      nginx:1.16.1
    Port:       80/TCP
    Host Port:  0/TCP
    Environment:        <none>
    Mounts:     <none>
  Volumes:      <none>
```

### 이전 수정 버전으로 롤백

- 현재 버전에서 이전 버전인 버전 2로 롤백

```bash
# 아래의 2가지 방법 중 하나로 롤백을 한다.
[root@node1 kubertest]# kubectl rollout undo deployment.v1.apps/nginx-deployment
[root@node1 kubertest]# kubectl rollout undo deployment.v1.apps/nginx-deployment --to-revision=2
deployment.apps/nginx-deployment rolled back

## 디플로이먼트 확인
[root@node1 kubertest]# kubectl get deployment nginx-deployment
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           71m

## 디플로이먼트 설명 가져오기
[root@node1 kubertest]# kubectl describe deployment nginx-deployment
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Fri, 11 Sep 2020 13:21:18 +0900
Labels:                 app=nginx
Annotations:            deployment.kubernetes.io/revision: 4
                        kubernetes.io/change-cause: kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record=true
Selector:               app=nginx
Replicas:               3 desired | 3 updated | 3 total | 3 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx
  Containers:
   nginx:
    Image:        nginx:1.16.1
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   nginx-deployment-559d658b74 (3/3 replicas created)
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  55m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 1
  Normal  ScalingReplicaSet  55m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 2
  Normal  ScalingReplicaSet  55m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 2
  Normal  ScalingReplicaSet  55m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 1
  Normal  ScalingReplicaSet  55m   deployment-controller  Scaled up replica set nginx-deployment-559d658b74 to 3
  Normal  ScalingReplicaSet  55m   deployment-controller  Scaled down replica set nginx-deployment-66b6c48dd5 to 0
  Normal  ScalingReplicaSet  24m   deployment-controller  Scaled up replica set nginx-deployment-66bc5d6c8 to 1
  Normal  ScalingReplicaSet  58s   deployment-controller  Scaled down replica set nginx-deployment-66bc5d6c8 to 0
```

## 디플로이먼트 스케일링

```bash
## 레플리카 갯수를 10개로 수정
[root@node1 kubertest]# kubectl scale deployment.v1.apps/nginx-deployment --replicas=10
deployment.apps/nginx-deployment scaled

## 클러스터에서 horizontal Pod autoscaling를 설정 한 경우 기존 파드의 CPU 사용률을 기준으로 실행할 최소 파드 및 최대 파드의 수를 선택
[root@node1 kubertest]# kubectl autoscale deployment.v1.apps/nginx-deployment --min=10 --max=15 --cpu-percent=80
horizontalpodautoscaler.autoscaling/nginx-deployment autoscaled
```

### 비례적 스케일링

- 디플로이먼트 컨트롤러가 위험을 줄이기 위해 기존 활성화된 레플리카셋(파드와 레플리카셋)의 추가 레플리카의 균형을 조절하는 것

```bash
## 디플로이먼트 삭제
[root@node1 kubertest]# kubectl delete -f nginx-deployment.yaml

## nginx-deployment.yaml 파일 수정
[root@node1 kubertest]# vi nginx-deployment.yaml

## yaml 파일 내용
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 10
  selector:
    matchLabels:
      app: nginx
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
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 3
      maxUnavailable: 2

## nginx-deployment.yaml 파일 실행
[root@node1 kubertest]# kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment configured

## 디플로이먼트에 10개의 레플리카가 실행되어있는지 확인
[root@node1 kubertest]# kubectl get deploy
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   10/10   10           10          83m

## 클러스터 내부에서 확인할 수 없는 새 이미지로 업데이트
[root@node1 kubertest]# kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:sometag
deployment.apps/nginx-deployment image updated

## 롤아웃 상태 확인
[root@node1 kubertest]# kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5cdd86fbf7   5         5         0       9s
nginx-deployment-66b6c48dd5   8         8         8       42s

## 새 레플리카가 정상이라고 가정하면 모든 레플리카를 새 레플리카셋으로 이동시킨다
[root@node1 kubertest]# kubectl get deploy
NAME               DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   15        18        18           10          14m
```

## 디플로이먼트의 일시중지와 재개

- 하나 이상의 업데이트를 트리거하기 전에 디플로이먼트를 일시 중지한 다음 다시 시작 가능
- 일시 중지된 디플로이먼트를 재개할 때까지 롤백할 수 없음

```bash
## 디플로이먼트 삭제
[root@node1 kubertest]# kubectl delete -f nginx-deployment.yaml
deployment.apps "nginx-deployment" deleted

## 레플리카셋 확인
[root@node1 kubertest]# kubectl get rs
No resources found in default namespace.

## 디플로이먼트 생성
[root@node1 kubertest]# kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment created

## 디플로이먼트 생성 확인
[root@node1 kubertest]# kubectl get deploy
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   10/10   10           10          9s

## 레플리카셋 확인
[root@node1 kubertest]# kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-66b6c48dd5   10        10        10      18s

## 디플로이먼트 일시중지
[root@node1 kubertest]# kubectl rollout pause deployment.v1.apps/nginx-deployment
deployment.apps/nginx-deployment paused

## 이미지 버전을 1.16버전으로 변경
[root@node1 kubertest]# kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1
deployment.apps/nginx-deployment image updated

## 롤아웃 기록 확인 (변동 없는 것으로 봐서 디플로이먼트가 성공적으로 업데이트 됨)
[root@node1 kubertest]# kubectl rollout history deployment.v1.apps/nginx-deployment
deployment.apps/nginx-deployment
REVISION  CHANGE-CAUSE
1         <none>

## 레플리카셋 상태 확인
[root@node1 kubertest]# kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-66b6c48dd5   10        10        10      113s

## 리소스 업데이트도 가능
[root@node1 kubertest]# kubectl set resources deployment.v1.apps/nginx-deployment -c=nginx --limits=cpu=200m,memory=512Mi
deployment.apps/nginx-deployment resource requirements updated

## 디플로이먼트 재개
[root@node1 kubertest]# kubectl rollout resume deployment.v1.apps/nginx-deployment
deployment.apps/nginx-deployment resumed

## 실시간으로 레플리카셋 확인
[root@node1 kubertest]# kubectl get rs -w
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-66b6c48dd5   0         0         0       3m16s
nginx-deployment-84864d5954   10        10        10      8s
```

## 디플로이먼트 상태

### 디플로이먼트 진행중

- 디플로이먼트로 새 레플리카셋을 생성.
- 디플로이먼트로 새로운 레플리카셋을 스케일 업.
- 디플로이먼트로 기존 레플리카셋을 스케일 다운.
- 새 파드가 준비되거나 이용할 수 있음(최소 [준비 시간(초)](https://kubernetes.io/ko/docs/concepts/workloads/controllers/deployment/#%EC%B5%9C%EC%86%8C-%EB%8C%80%EA%B8%B0-%EC%8B%9C%EA%B0%84-%EC%B4%88) 동안 준비됨).
- `kubectl rollout status` 로 진행상황 모니터링 가능

### 디플로이먼트 완료

- 디플로이먼트과 관련된 모든 레플리카가 지정된 최신 버전으로 업데이트 되었을 때. 즉, 요청한 모든 업데이트가 완료되었을 때.
- 디플로이먼트와 관련한 모든 레플리카를 사용할 수 있을 때.
- 디플로이먼트에 대해 이전 복제본이 실행되고 있지 않을 때.

```bash
[root@node1 kubertest]# kubectl rollout status deployment.v1.apps/nginx-deployment
deployment "nginx-deployment" successfully rolled out
```

### 디플로이먼트 실패

- 할당량 부족
- 준비성 프로브(readiness probe)의 실패
- 이미지 풀 에러
- 권한 부족
- 범위 제한
- 애플리케이션 런타임의 잘못된 구성

# 스테이트풀셋

- 애플리케이션의 스테이트풀을 관리하는데 사용하는 워크로드 API 오브젝트
- 파드 집합의 디플로이먼트와 스케일링을 관리하며, 파드들의 순서 및 고유성을 보장
- 디플로이먼트와 유사하게, 스테이트풀셋은 동일한 컨테이너 스펙을 기반으로 둔 파드들을 관리한다. 디플로이먼트와는 다르게, 스테이트풀셋은 각 파드의 독자성을 유지

## 스테이트풀셋 생성

```bash
## 네트워크 도메인을 컨트롤하는데 사용
apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: nginx
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: nginx # has to match .spec.template.metadata.labels (2개의 레이블이 동일해야 함)
  serviceName: "nginx"
  ## 3개의 niginx 컨테이너의 레플리카가 고유의 파드에서 구동될 것이라 지시
  replicas: 3 # by default is 1
  template:
    metadata:
      labels:
        app: nginx # has to match .spec.selector.matchLabels (2개의 레이블이 동일해야 함)
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: k8s.gcr.io/nginx-slim:0.8
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  ## 퍼시스턴트 볼륨을 사용해서 안정적인 스토리지를 제공
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "my-storage-class"
      resources:
        requests:
          storage: 1Gi
```

# 데몬셋

- 모든 노드에서 뭔가 하나씩 띄우기 위해 사용
    - 모든 노드에서 클러스터 스토리지 데몬 실행
    - 모든 노드에서 로그 수집 데몬 실행
    - 모든 노드에서 노드 모니터링 데몬 실행

## 데몬셋 생성

```bash
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: kube-system
  labels:
    k8s-app: fluentd-logging
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      tolerations:
      # this toleration is to have the daemonset runnable on master nodes
      # remove it if your masters can't run pods
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      containers:
      - name: fluentd-elasticsearch
        image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```
