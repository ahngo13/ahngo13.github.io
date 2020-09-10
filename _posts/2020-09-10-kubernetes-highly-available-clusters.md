---
title: kubeadm을 활용한 쿠버네티스 고가용성 클러스터 구축(Creating Highly Available clusters with kubeadm)
layout: post
date: '2020-09-10 17:59:00 +0300'
description: 쿠버네티스는 컨테이너화된 워크로드와 서비스를 관리하기 위한 이식성이 있고 확장가능한 오픈소스 플랫폼
img: null
fig-caption: null
tags:
- kubernetes
- 쿠버네티스
---

# 구성목표

- 마스터 노드 3개의 클러스터 구성
- 가상 네트워크 (Calico) 적용

# 사전 작업하기

## 가상 머신 세팅

- Windows 10 Hyper-V로 3개의 가상머신 생성
    - OS: CentOS7 Minimal
    - RAM : 2048MB
    - HDD : 20GB
    - CPU : 2

![/assets/img/kuberneteshighlyavailableclusters.png](/assets/img/kuberneteshighlyavailableclusters.png)

### 마스터, 워커에 대한 가상머신 최소 요구 사항

- 다음 중 하나를 실행하는 하나 이상의 머신 :
    - Ubuntu 16.04 이상
    - Debian 9 이상
    - CentOS 7
    - RHEL (Red Hat Enterprise Linux) 7
    - Fedora 25 이상
    - HypriotOS v1.0.1 이상
    - Flatcar Container Linux (2512.3.0으로 테스트 됨)
- 컴퓨터 당 2GB 이상의 RAM (그보다 적 으면 앱을위한 공간이 거의 남지 않음)
- CPU 2 개 이상
- 클러스터의 모든 시스템 간의 전체 네트워크 연결 (공용 또는 사설 네트워크는 괜찮음)
- 모든 노드에 대한 고유 한 호스트 이름, MAC 주소 및 product_uuid. 자세한 내용은 [여기](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#verify-mac-address)

    를 참조하십시오.

- 컴퓨터에서 특정 포트가 열려 있습니다. 자세한 내용은 [여기](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#check-required-ports)

    를 참조하십시오.

- 스왑이 비활성화되었습니다. 당신은 **반드시**

    제대로 작동하려면 kubelet 위해서는 스왑을 사용하지 않도록 설정합니다.

```bash
## 방화벽 해제 및 종료
[root@localhost ~]# systemctl disable firewalld && sudo systemctl stop firewalld

## paging과 swap 기능 종료
[root@localhost ~]# swapoff -a

## 커널 속성 변경 (swap disable)
[root@localhost ~]# echo 0 > /proc/sys/vm/swappiness

## swap을 하는 파일 시스템을 찾아 disable 처리
[root@localhost ~]# sed -e '/swap/ s/^#*/#/' -i /etc/fstab

## RHEL, CentOS 7 기준 iptables 이슈로 인한 커널 매개변수 수정
## iptables가 브리지 된 트래픽을 보게하기
[root@localhost ~]# cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
## 수정된 매개변수 확인
[root@localhost ~]# sysctl --system
* Applying /usr/lib/sysctl.d/00-system.conf ...
net.bridge.bridge-nf-call-ip6tables = 0
net.bridge.bridge-nf-call-iptables = 0
net.bridge.bridge-nf-call-arptables = 0
* Applying /usr/lib/sysctl.d/10-default-yama-scope.conf ...
kernel.yama.ptrace_scope = 0
* Applying /usr/lib/sysctl.d/50-default.conf ...
kernel.sysrq = 16
kernel.core_uses_pid = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.promote_secondaries = 1
net.ipv4.conf.all.promote_secondaries = 1
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
* Applying /etc/sysctl.d/99-sysctl.conf ...
* Applying /etc/sysctl.d/k8s.conf ...
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
* Applying /etc/sysctl.conf ... 

## br_netfilter 모듈 활성화
[root@localhost ~]# modprobe br_netfilter

## 모듈 추가 확인
[root@localhost ~]# lsmod | grep br_netfilter
br_netfilter           22256  0
bridge                151336  1 br_netfilter

## 도커 설치
[root@localhost ~]# yum install docker-ec -y

## 부팅시 도커 자동으로 실행하게 설정
[root@localhost ~]# systemctl start docker.service
```

## Docker cgroup setting

```bash
cat <<EOF > /etc/docker/daemon.json
{
"exec-opts": ["native.cgroupdriver=systemd"],
"log-driver": "json-file",
"log-opts": {
"max-size": "100m"
},
"storage-driver": "overlay2",
"storage-opts": [
"overlay2.override_kernel_check=true"
]
}
EOF

systemctl daemon-reload
systemctl enable docker
systemctl restart docker

kubeadm reset -f
rm -rf /etc/kubernetes
rm -rf /etc/cni
rm -rf /var/lib/etcd
rm -rf /var/lib/kubenet
rm -rf /var/lib/kubelet
rm -rf /root/.kube
```

- 쿠버네티스가 사용하는 포트들이므로 비워둬야 하며 모두 열려있어야 한다.

![/assets/img/kuberneteshighlyavailableclusters1.png](/assets/img/kuberneteshighlyavailableclusters1.png)

# kubeadm, kubelet 및 kubectl 설치하기

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
exclude=kubelet kubeadm kubectl
EOF

## SELinux(Security-Enhanced Linux) 리눅스 보안 모듈(액세스 권한 제어) 해당 기능 끄기
[root@localhost ~]# setenforce 0
[root@localhost ~]# sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

## kubelet, kubeadm, kubectl 설치
yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

## kubelet 활성화
[root@localhost ~]# systemctl enable --now kubelet
Created symlink from /etc/systemd/system/multi-user.target.wants/kubelet.service to /usr/lib/systemd/system/kubelet.service.
```

# 고가용성 클러스터 구축 시작

## 호스트네임 설정

- 각각의 가상머신 마다 hostname을 다르게 설정

```bash
## CentOS1
[root@localhost ~]# hostnamectl set-hostname node1

## CentOS2
[root@localhost ~]# hostnamectl set-hostname node2

## CentOS3
[root@localhost ~]# hostnamectl set-hostname node3
```

## kube-apiserver용 로드 밸런서 설치

- node1에만 haproxy 설치

```bash
yum install haproxy -y
```

- node1 IP의 26643 포트로 전달받은 데이터를 node1 ~ node3의 6443 포트로 포워드 시키기

```bash
[root@localhost ~]# vi /etc/haproxy/haproxy.cfg
frontend kubernetes-master-lb
bind 0.0.0.0:26443
option tcplog
mode tcp
default_backend kubernetes-master-nodes

backend kubernetes-master-nodes
mode tcp
balance roundrobin
option tcp-check
option tcplog
server node1 172.31.218.71:6443 check ## node1
server node2 172.31.211.174:6443 check ## node2
server node3 172.31.220.154:6443 check ## node3

## haproxy 재시작
[root@localhost ~]# systemctl restart haproxy
```

## node1 클러스터 생성

```bash
kubeadm init --control-plane-endpoint "172.31.218.71:26443" \
                --upload-certs \
                --pod-network-cidr=192.168.0.0/16 ## container의 아이피 할당 범위 설정 Calico on Kubernetes 기준 
```

## node2, node3 image pull

```bash
kubeadm config images pull
```

## config 생성

- 권한이 필요하다면 사용자 디렉토리 하위에 `.kube/config` 생성 (master node에서 모두 실행)

```bash
mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

## master node 연결

```bash
kubeadm join 172.31.218.71:26443 --token q4nwtd.4gz9ertus6c1sb3s \
    --discovery-token-ca-cert-hash sha256:4dcd823eb577d2efd08a9b269e3c546785b521a9146ae748d1420e5fcc51be9d \
    --control-plane --certificate-key bea375424cf6fa409e8f4812d8da575922cc4c8c3520873263ea08f954d607cc
```

## work node 연결

```bash
kubeadm join 172.31.218.71:26443 --token q4nwtd.4gz9ertus6c1sb3s \
    --discovery-token-ca-cert-hash sha256:4dcd823eb577d2efd08a9b269e3c546785b521a9146ae748d1420e5fcc51be9d
```

## node 상태 확인

```bash
[root@node1 ~]# kubectl get nodes
NAME    STATUS     ROLES    AGE     VERSION
node1   NotReady   master   3m14s   v1.19.1
node2   NotReady   master   68s     v1.19.1
node3   NotReady   master   64s     v1.19.1
```

## Calico yaml 파일 실행

```bash
kubectl create -f https://docs.projectcalico.org/manifests/tigera-operator.yaml
kubectl create -f https://docs.projectcalico.org/manifests/custom-resources.yaml
```

## taint 삭제 (pod 생성을 막으므로 삭제)

```bash
kubectl taint nodes --all node-role.kubernetes.io/master-
```

## pod 조회

- `-A` : 전부 조회

```bash
[root@node1 ~]# kubectl get pod -A
NAMESPACE         NAME                                       READY   STATUS    RESTARTS   AGE
calico-system     calico-kube-controllers-69fbbf7967-ltqvx   1/1     Running   0          59s
calico-system     calico-node-pdd8n                          0/1     Running   0          59s
calico-system     calico-node-tgm7d                          0/1     Running   0          59s
calico-system     calico-node-v6zz6                          0/1     Running   0          59s
calico-system     calico-typha-7f44c5b874-mfhnd              1/1     Running   0          59s
kube-system       coredns-f9fd979d6-dbbqg                    1/1     Running   0          5m2s
kube-system       coredns-f9fd979d6-r2bs9                    1/1     Running   0          5m2s
kube-system       etcd-node1                                 1/1     Running   0          5m11s
kube-system       etcd-node2                                 1/1     Running   0          3m11s
kube-system       etcd-node3                                 1/1     Running   0          3m
kube-system       kube-apiserver-node1                       1/1     Running   0          5m11s
kube-system       kube-apiserver-node2                       1/1     Running   0          3m14s
kube-system       kube-apiserver-node3                       1/1     Running   0          101s
kube-system       kube-controller-manager-node1              1/1     Running   1          5m11s
kube-system       kube-controller-manager-node2              1/1     Running   0          3m10s
kube-system       kube-controller-manager-node3              1/1     Running   0          113s
kube-system       kube-proxy-6m5kb                           1/1     Running   0          2m33s
kube-system       kube-proxy-n8zpl                           1/1     Running   0          5m2s
kube-system       kube-proxy-xhhfc                           1/1     Running   0          3m15s
kube-system       kube-scheduler-node1                       1/1     Running   1          5m11s
kube-system       kube-scheduler-node2                       1/1     Running   0          3m14s
kube-system       kube-scheduler-node3                       1/1     Running   0          98s
tigera-operator   tigera-operator-646f758f9b-2l9hg           1/1     Running   0          69s
```
