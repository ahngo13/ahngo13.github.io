---
title: 윈도우10에서 쿠버네티스(Kubernetes) 클러스터 구성하기
layout: post
date: 2020-09-08 17:58:00 +0300
description: 컨테이너 운영을 자동화하기 위한 컨테이너 오케스트레이션 도구
img:  # Add image post (optional)
fig-caption: # Add figcaption (optional)
tags: [도커, kubernetes, 쿠버네티스, 클러스터, cluster]
---

# 쿠버네티스란?

- 컨테이너 운영을 자동화하기 위한 컨테이너 오케스트레이션 도구 (풀어서 말하면 많은 컨테이너를 협조적으로 연동시키기 위한 통합 시스템, API와 명령행 도구인 kubectl, Minikube 등 도구 제공)
- 배포 이외에도 배치, 스케일링, 로드 밸런싱, 헬스 체크 등 기능 보유
- 유연한 애플리케이션 구축 가능
- 컴포즈, 스택, 스웜 기능을 통합하여 고수준의 관리 기능 제공

# Minikube 설치 및 실행 (Window10 기준)

- 관리자 권한으로 cmd창을 실행해야 설치가 정상적으로 됨
- `Hyper-V 설치`와 `Docker Desktop` 실행까지는 이미 되었다는 가정하에 진행
- 드라이버가 필자와 다를 경우 해당사이트에서 확인 - [https://kubernetes.io/ko/docs/setup/learning-environment/minikube/#vm-드라이버-지정하기](https://kubernetes.io/ko/docs/setup/learning-environment/minikube/#vm-%EB%93%9C%EB%9D%BC%EC%9D%B4%EB%B2%84-%EC%A7%80%EC%A0%95%ED%95%98%EA%B8%B0)

```bash
## choco 설치
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

## minikube 설치
choco install minikube

## minikube 클러스터 실행 (드라이버는 hyperv 기준으로 세팅함)
C:\WINDOWS\system32>minikube start --driver=hyperv

## minikube 클러스터 상태 확인
C:\WINDOWS\system32>minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured

## minikube 클러스터 중지
C:\WINDOWS\system32>minikube stop
* Stopping node "minikube"  ...
* 1 nodes stopped.
```

# Minikube로 쿠버네티스 설치하기

```bash
## minikube를 시작하고 클러스터를 생성
C:\WINDOWS\system32>minikube start
* Microsoft Windows 10 Pro 10.0.19041 Build 19041 위의 minikube v1.13.0
* 기존 프로필에 기반하여 hyperv 드라이버를 사용하는 중
* Starting control plane node minikube in cluster minikube
* Restarting existing hyperv VM for "minikube" ...
* 쿠버네티스 v1.19.0 을 Docker 19.03.12 런타임으로 설치하는 중
* Verifying Kubernetes components...
* Enabled addons: default-storageclass, storage-provisioner

! C:\Program Files\Docker\Docker\resources\bin\kubectl.exe is version 1.16.6-beta.0, which may have incompatibilites with Kubernetes 1.19.0.
* Want kubectl v1.19.0? Try 'minikube kubectl -- get pods -A'
* Done! kubectl is now configured to use "minikube" by default

## 간단한 http 서버인 echoserver를 8080포트로 노출하기
C:\WINDOWS\system32>kubectl create deployment hello-minikube --image=k8s.gcr.io/echoserver:1.10
deployment.apps/hello-minikube created

C:\WINDOWS\system32>kubectl expose deployment hello-minikube --type=NodePort --port=8080
service/hello-minikube exposed

## 노출된 서비스를 접근하기 전에 파트가 떴는지 확인
## 파드는 하나 또는 그 이상의 애플리케이션 컨테이너 (도커 또는 rkt와 같은)들의 그룹을 나타내는 쿠버네티스의 추상적 개념
C:\WINDOWS\system32>kubectl get pod
NAME                              READY   STATUS    RESTARTS   AGE
hello-minikube-5d9b964bfb-wdl9f   1/1     Running   0          2m57s

## 서비스 상세를 보기 위해 url 정보 얻기
C:\WINDOWS\system32>minikube service hello-minikube --url
http://172.21.19.43:32512
```

- URL을 통해 로컬 클러스터의 상세 확인

![/assets/img/kubernetes1.png](/assets/img/kubernetes1.png)

```bash
## hello-minikube 서비스 삭제
C:\WINDOWS\system32>kubectl delete services  hello-minikube

## hello-minikube deployment 삭제                                                             service "hello-minikube" deleted                                                                                        
C:\WINDOWS\system32>kubectl delete deployment hello-minikube
deployment.apps "hello-minikube" deleted

## 로컬 minikube 클러스터 중지
C:\WINDOWS\system32>minikube stop
* Stopping node "minikube"  ...
* Powering off "minikube" via SSH ...
E0909 17:38:41.574408   26032 main.go:111] libmachine: [stderr =====>] : Hyper-V\Stop-VM : Windows PowerShell is in NonInteractive mode. Read and Prompt functionality is not available.
At line:1 char:1
+ Hyper-V\Stop-VM minikube
+ ~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (:) [Stop-VM], VirtualizationException
    + FullyQualifiedErrorId : InvalidOperation,Microsoft.HyperV.PowerShell.Commands.StopVM

* Stopping node "minikube"  ...
* 1 nodes stopped.

## 로컬 minikube 클러스터 삭제
C:\WINDOWS\system32>minikube delete
* Stopping node "minikube"  ...
* hyperv 의 "minikube" 를 삭제하는 중 ...
* "minikube" 클러스터 관련 정보가 모두 삭제되었습니다
```

# 클러스터 관리하기

## 클러스터 시작하기

- `minikube start`

### 프록시 지정

```bash
minikube start --docker-env http_proxy=<my proxy> --docker-env https_proxy=<my proxy> --docker-env no_proxy=192.168.99.0/24
```

### 쿠버네티스 버전 지정

```bash
minikube start --kubernetes-version v1.19.0
```

### VM 드라이버 지정 (택 1)

- docker ([드라이버 설치](https://minikube.sigs.k8s.io/docs/drivers/docker/))
- virtualbox ([드라이버 설치](https://minikube.sigs.k8s.io/docs/drivers/virtualbox/))
- podman ([드라이버 설치](https://minikube.sigs.k8s.io/docs/drivers/podman/)) (EXPERIMENTAL)
- vmwarefusion
- kvm2 ([드라이버 설치](https://minikube.sigs.k8s.io/docs/reference/drivers/kvm2/))
- hyperkit ([드라이버 설치](https://minikube.sigs.k8s.io/docs/reference/drivers/hyperkit/))
- hyperv ([드라이버 설치](https://minikube.sigs.k8s.io/docs/reference/drivers/hyperv/)) 다음 IP는 동적이며 변경할 수 있다. `minikube ip`로 알아낼 수 있다.
- vmware ([드라이버 설치](https://minikube.sigs.k8s.io/docs/reference/drivers/vmware/)) (VMware unified driver)
- parallels ([드라이버 설치](https://minikube.sigs.k8s.io/docs/reference/drivers/parallels/))
- none (쿠버네티스 컴포넌트를 가상 머신이 아닌 호스트 상에서 구동한다. 리눅스를 실행중이어야 하고, [도커(Docker)](https://docs.docker.com/engine/)가 설치되어야 한다.)

```bash
minikube start --driver=<driver_name>
```

### 컨테이너 런타임 상에서 클러스터 시작하기

```bash
## 기본 버전
minikube start \
    --network-plugin=cni \
    --enable-default-cni \
    --container-runtime=containerd \
    --bootstrapper=kubeadm

## 확장 버전
minikube start \
    --network-plugin=cni \
    --enable-default-cni \
    --extra-config=kubelet.container-runtime=remote \
    --extra-config=kubelet.container-runtime-endpoint=unix:///run/containerd/containerd.sock \
    --extra-config=kubelet.image-service-endpoint=unix:///run/containerd/containerd.sock \
    --bootstrapper=kubeadm
```

### 도커 데몬 재사용을 통한 로컬 이미지 사용하기

- `도커데몬(dockerd)`은 도커 API를 입력받아 도커 엔진의 기능을 수행
- 쿠버네티스 단일 VM을 사용하면 minikube에 내장된 도커 데몬을 재사용하기에 간편
- 호스트 장비에 도커 레지스트리를 설치하고 이미지를 푸시할 필요가 없음
(minikube와 동일한 도커 데몬 안에서 이미지를 빌드하기 때문)
- 맥이나 리눅스 호스트에서 해당 Docker 데몬을 사용하려면 `minikube docker-env` 에서 마지막 줄을 실행

※ 참고 사이트

[https://kubernetes.io/ko/docs/setup/learning-environment](https://kubernetes.io/ko/docs/setup/learning-environment)
