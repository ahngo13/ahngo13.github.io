---
title: 쿠버네티스 Ceph 설치 및 스토리지(block, file) 실습
layout: post
date: '2020-09-15 17:58:00 +0300'
description: 오픈 소스 소프트웨어 스토리지 플랫폼으로, 단일 분산 컴퓨터 클러스터에서 오브젝트 스토리지를 구현하고 오브젝트, 블록 및 파일 레벨 스토리지를위한 3in1 인터페이스를 제공
img: null
fig-caption: null
tags:
- kubernetes
- 쿠버네티스
- ceph
- kubernetesstorage
---

## Rook

- Ceph 설치에 필요한 도구
- 오픈소스 클라우드 네이티브 스토리지 오케스트레이터
- 라우드 네이티브 환경과 기본적으로 통합할 수 있는 다양한 스토리지 솔루션 세트에 대한 플랫폼, 프레임 워크 및 지원
- 쿠버네티스 POD에서 실행되며, Ceph(공유 확장에 특화), EdgeFS(데이터베이스 처럼 대용량의 스트로지가 필요할 때)등 가상솔루션을 POD로 배포하여 관리하는 도구

# Ceph란?

- 오픈 소스 소프트웨어 스토리지 플랫폼으로, 단일 분산 컴퓨터 클러스터에서 오브젝트 스토리지를 구현하고 오브젝트, 블록 및 파일 레벨 스토리지를위한 3in1 인터페이스를 제공

- **모니터** : [Ceph 모니터](https://docs.ceph.com/docs/master/glossary/#term-Ceph-Monitor) ( `ceph-mon`)는 모니터 맵, 관리자 맵, OSD 맵, MDS 맵 및 CRUSH 맵을 포함하여 클러스터 상태의 맵을 유지합니다. 이러한 맵은 Ceph 데몬이 서로 조정하는 데 필요한 중요한 클러스터 상태입니다. 모니터는 데몬과 클라이언트 간의 인증 관리도 담당합니다. 이중화 및 고 가용성을 위해 일반적으로 최소 3 개의 모니터가 필요합니다.
- **관리자** : [Ceph Manager](https://docs.ceph.com/docs/master/glossary/#term-Ceph-Manager) 데몬 ( `ceph-mgr`)은 스토리지 사용률, 현재 성능 메트릭 및 시스템로드를 포함하여 Ceph 클러스터의 현재 상태 및 런타임 메트릭을 추적합니다. Ceph Manager 데몬은 또한 Python 기반 모듈을 호스팅하여 웹 기반 [Ceph Dashboard](https://docs.ceph.com/docs/master/mgr/dashboard/#mgr-dashboard) 및 [REST API를](https://docs.ceph.com/docs/master/mgr/restful) 포함하여 Ceph 클러스터 정보를 관리하고 노출 [합니다](https://docs.ceph.com/docs/master/mgr/restful) . 고 가용성을 위해 일반적으로 두 개 이상의 관리자가 필요합니다.
- **Ceph OSD** : [Ceph OSD](https://docs.ceph.com/docs/master/glossary/#term-Ceph-OSD) (개체 저장 데몬 `ceph-osd`)는 데이터를 저장하고, 데이터 복제, 복구, 재조정을 처리하고 다른 Ceph OSD 데몬에서 하트 비트를 확인하여 일부 모니터링 정보를 Ceph 모니터 및 관리자에 제공합니다. 이중화 및 고 가용성을 위해 일반적으로 최소 3 개의 Ceph OSD가 필요합니다.
- **MDS** : [Ceph Metadata Server](https://docs.ceph.com/docs/master/glossary/#term-Ceph-Metadata-Server) (MDS, `ceph-mds`)는 [Ceph 파일 시스템](https://docs.ceph.com/docs/master/glossary/#term-Ceph-File-System) 을 대신하여 메타 데이터를 저장 [합니다](https://docs.ceph.com/docs/master/glossary/#term-Ceph-File-System) (즉, Ceph Block Devices 및 Ceph Object Storage는 MDS를 사용하지 않음). Ceph Metadata Server를 사용하면 POSIX 파일 시스템 사용자가 Ceph Storage Cluster에 큰 부담을주지 않고 기본 명령 (예 `ls`: `find`, 등) 을 실행할 수 있습니다.

## Ceph 주요 기능

- 다수의 Region에서 운영하는 클러스터 사이의 싱글 네임 스페이스와 데이터 동기화 기능 제공
- 액티브 디렉토리, LDAP 및 Keystone v3 등을 포함하는 openstack 인증시스템과 통합해 향상한 보안기능지원
- AWS v4 클라이언트 시그니처, object versioning 등에 대한 지원을 포함하는 향상된 아마존 s3 및 openstack swift와 호환성 지원
- 간단한 UI를 통해 스토리지 관리 및 모니터링을 지원하는 시스템인 redhat storage 콘솔 2를 포함해 구축, 운영 및 관리를 간소화 지원
- 용량을 페타바이트 수준으로 손쉽게 확장 가능

## Ceph 스토리지 유형

- Block Storage : 단일 POD에 스토리지 제공함.
- Object Storage : 애플리케이션이 쿠버네티스 클러스터 내부 또는 외부에서 액세스 할수있는 데이터를 입출력 할수있고, S3 API를 스토리지 클러스터에 노출을 제공함
- Shared Stroage : 여러 POD에서 공유할 수 있는 파일 시스템 기반 스토리지

# Ceph 설치

## 테스트 환경

- 쿠버네티스 고가용성 클러스터 구성이 완료된 상태로 진행한다.

[https://ahngo13.github.io/kubernetes-highly-available-clusters/](https://ahngo13.github.io/kubernetes-highly-available-clusters/)

## Ceph 소스 다운로드 및 실습 환경 세팅

- 지우고 다시 작업할 경우 각 node별로  `rm -rf /var/lib/rook` 필요

```bash
## git이 없을 경우 git 설치
yum install -y git

## git 레파지토리에서 root-ceph 다운
git clone --single-branch --branch v1.4.3 https://github.com/rook/rook.git

## pod 배포하기
# Rook 배포에 필요한 공통 리소스를 생성
cd rook/cluster/examples/kubernetes/ceph

kubectl create -f common.yaml
namespace/rook-ceph created

kubectl create -f operator.yaml
configmap/rook-ceph-operator-config created
deployment.apps/rook-ceph-operator created

kubectl create -f cluster-test.yaml
cephcluster.ceph.rook.io/rook-ceph created

## pod의 osd가 모두 Running 상태가 되어있는지 확인 (일정시간 소요)
# 실시간으로 반복적인 명령어를 실행시키고 싶을 때 (1초 단위)
watch -n 1 kubectl get pod -n rook-ceph
# 그냥 모니터링용
[root@node1 ~]# kubectl get pod -n rook-ceph -w
NAME                                            READY   STATUS      RESTARTS   AGE
csi-cephfsplugin-9zw6k                          3/3     Running     0          23m
csi-cephfsplugin-provisioner-7468b6bf56-v499m   6/6     Running     0          23m
csi-cephfsplugin-provisioner-7468b6bf56-w4zmn   0/6     Pending     0          23m
csi-rbdplugin-jwb66                             3/3     Running     0          24m
csi-rbdplugin-provisioner-77459cc496-597m8      6/6     Running     0          23m
csi-rbdplugin-provisioner-77459cc496-vwl9k      0/6     Pending     0          23m
rook-ceph-mgr-a-c4cfbbcf7-59r8k                 1/1     Running     0          23m
rook-ceph-mon-a-f5fd779c6-bdjhs                 1/1     Running     0          23m
rook-ceph-operator-68679ff94-7sz59              1/1     Running     0          24m
rook-ceph-osd-0-7d44c46f8c-mdn9w                1/1     Running     0          23m
rook-ceph-osd-prepare-node1-dx62h               0/1     Completed   0          23m
rook-discover-ckbj9                             1/1     Running     0          24m

## keyring 오류 발생시 생성
kubectl -n rook-ceph create secret generic rook-ceph-crash-collector-keyring
```

## Block Storage 실습

- 스토리지를 프로비저닝 하기 위해 `StroageClass` 및 `CephBlockPool` 을 생성해야 함

```bash
## 스토리지 클래스 생성
kubectl create -f cluster/examples/kubernetes/ceph/csi/rbd/storageclass-test.yaml

## mysql 및 wordpress 샘플 생성
kubectl create -f mysql.yaml
kubectl create -f wordpress.yaml

## 아래와 같이 pvc가 생성되지 않았다면 실패한 것이다.
## 필자의 경우 고가용성 클러스터 설정부터 single 노드로 변경하여 재세팅하여 겨우 성공했다.
kubectl get pvc
NAME             STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
mysql-pv-claim   Bound    pvc-23a395ba-07f8-4b28-936b-86e74e65195e   20Gi       RWO            rook-ceph-block   19m
wp-pv-claim      Bound    pvc-7d98c164-9bf7-418e-99ee-49259dd2b9a4   20Gi       RWO            rook-ceph-block   8s

## 디스크나 파티션 부분에서도 문제가 발생한다고 하니 필자 기준의 세팅을 참고하기 바란다.
[root@node1 kubernetes]# fdisk -l

Disk /dev/sda: 136.4 GB, 136365211648 bytes, 266338304 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disk label type: dos
Disk identifier: 0x000c01bb

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048     2099199     1048576   83  Linux
/dev/sda2         2099200   266338303   132119552   8e  Linux LVM

Disk /dev/sdb: 21.5 GB, 21474836480 bytes, 41943040 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes

Disk /dev/mapper/centos-root: 53.7 GB, 53687091200 bytes, 104857600 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes

Disk /dev/mapper/centos-swap: 2147 MB, 2147483648 bytes, 4194304 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes

Disk /dev/mapper/centos-home: 79.4 GB, 79448506368 bytes, 155172864 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes

Disk /dev/mapper/ceph--0e128686--a120--4ee8--835c--88592e12a79c-osd--data--b3800f4f--2c4c--4d82--adf0--93f41f644741: 21.5 GB, 21470642176 bytes, 41934848 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes

Disk /dev/rbd0: 21.5 GB, 21474836480 bytes, 41943040 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4194304 bytes / 4194304 bytes

Disk /dev/rbd1: 21.5 GB, 21474836480 bytes, 41943040 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4194304 bytes / 4194304 bytes
```

## Shared File Storage 실습

### Shared Storage 유형 적용

- MDS POD 배포

```bash
[root@node1 ceph]# kubectl create -f filesystem-test.yaml
cephfilesystem.ceph.rook.io/myfs created

[root@node1 ceph]# kubectl -n rook-ceph get pod -l app=rook-ceph-mds
NAME                                    READY   STATUS    RESTARTS   AGE
rook-ceph-mds-myfs-a-75764466cf-8xsvk   1/1     Running   0          26s
rook-ceph-mds-myfs-b-574985f789-pnf6b   1/1     Running   0          26s
```

### StorageClass Driver 적용

- Ceph 데이터 풀에 접근하기 위해 사용되는 드라이버

```bash
kubectl create -f storageclass.yaml
```

### Shared Storage 확인

```bash
[root@node1 ceph]# kubectl get CephFileSystem -A
NAMESPACE   NAME   ACTIVEMDS   AGE
rook-ceph   myfs   1           100s
```

### Shared Storage 테스트

- kube-registry를 배포하면 PVC, docker-registry PID가 배포됨
- 컨테이너 내부에 접근하여 `/var/lib/registry` 디렉터리에 dummy 파일을 생성하여 다른 pod에서 공유되는지 확인
- `cluster/examples/kubernetes/ceph/csi/cephfs/` 경로에 yaml 파일이 위치함

```yaml
## pvc만 생성한다.
## kubectl create kube-registry.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cephfs-pvc
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
  storageClassName: rook-cephfs
---

## 아래의 디플로이먼트로 테스트할 수도 있지만 새로운 디플로이먼트로 만들어서 실습할 것이다.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-registry
  ## 네임 스페이스 필요
  namespace: kube-system
  labels:
    k8s-app: kube-registry
    kubernetes.io/cluster-service: "true"
spec:
  replicas: 3
  selector:
    matchLabels:
      k8s-app: kube-registry
  template:
    metadata:
      labels:
        k8s-app: kube-registry
        kubernetes.io/cluster-service: "true"
    spec:
      containers:
      - name: registry
        image: registry:2
        imagePullPolicy: Always
        resources:
          limits:
            cpu: 100m
            memory: 100Mi
        env:
        # Configuration reference: https://docs.docker.com/registry/configuration/
        - name: REGISTRY_HTTP_ADDR
          value: :5000
        - name: REGISTRY_HTTP_SECRET
          value: "Ple4seCh4ngeThisN0tAVerySecretV4lue"
        - name: REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY
          value: /var/lib/registry
       ## 볼륨 마운트 필요
        volumeMounts:
        - name: image-store
          mountPath: /var/lib/registry
        ports:
        - containerPort: 5000
          name: registry
          protocol: TCP
        livenessProbe:
          httpGet:
            path: /
            port: registry
        readinessProbe:
          httpGet:
            path: /
            port: registry
     ## 볼륨 필요
      volumes:
      - name: image-store
        persistentVolumeClaim:
          claimName: cephfs-pvc
          readOnly: false
```

- 새로운 디플로이먼트 생성
    - `kubectl create -f test.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-test
  namespace: kube-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      name: nginx-test
      namespace: kube-system
      labels:
        app: nginx
        kubernetes.io/cluster-service: "true"
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        volumeMounts:
        - name: image-store
          mountPath: /var/lib/registry
      volumes:
      - name: image-store
        persistentVolumeClaim:
          claimName: cephfs-pvc
          readOnly: false
```

- 다른 pod에서도 파일이 공유되는지 테스트

```bash
[root@node1 cephfs]# kubectl get pod -n kube-system
NAME                             READY   STATUS    RESTARTS   AGE
coredns-f9fd979d6-l665j          1/1     Running   1          168m
coredns-f9fd979d6-x2gql          1/1     Running   1          168m
etcd-node1                       1/1     Running   1          168m
kube-apiserver-node1             1/1     Running   1          168m
kube-controller-manager-node1    1/1     Running   1          168m
kube-proxy-t7r7n                 1/1     Running   1          168m
kube-registry-66d4c7bf47-8c276   1/1     Running   0          112m
kube-registry-66d4c7bf47-g7lpq   1/1     Running   0          112m
kube-registry-66d4c7bf47-rr8pg   1/1     Running   0          112m
kube-scheduler-node1             1/1     Running   1          168m
## 정상적으로 3개의 pod가 실행되고 있음을 확인 가능
nginx-test-76867f8cb7-49f6g      1/1     Running   0          39m
nginx-test-76867f8cb7-gwq5s      1/1     Running   0          39m
nginx-test-76867f8cb7-qhkp2      1/1     Running   0          39m

## 3개의 pod 중 하나의 pod에 접속
[root@node1 cephfs]# kubectl exec -it -n kube-system nginx-test-76867f8cb7-49f6g bash
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.

## 볼륨을 걸어놓은 경로에 test 파일 생성
root@nginx-test-76867f8cb7-49f6g:/# cd /var/lib/registry/
root@nginx-test-76867f8cb7-49f6g:/var/lib/registry# touch test
root@nginx-test-76867f8cb7-49f6g:/var/lib/registry# ls
test

## 새로운 창을 하나 더 띄워서 다른 pod로 접속
[root@node1 ~]# kubectl exec -it -n kube-system nginx-test-76867f8cb7-gwq5s bash
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.
root@nginx-test-76867f8cb7-gwq5s:/# cd /var/lib/registry

## test 파일이 다른 pod에도 있음을 확인
root@nginx-test-76867f8cb7-gwq5s:/var/lib/registry# ls
test
```
