---
title: Kubernetes DashBoard 설치 및 세팅 방법
layout: post
date: '2020-09-16 17:58:00 +0300'
description: DashBoard는 쿠버네티스 사용자 인터페이스(UI), 컨테이너화 된 애플리케이션을 클러스터에 배포, 문제 해결, 클러스터 리소스 관리
img: null
fig-caption: null
tags:
- kubernetes
- 쿠버네티스
- kubernetesdashboard
- 쿠버네티스대시보드
---

- DashBoard는 쿠버네티스 사용자 인터페이스(UI)
- 컨테이너화 된 애플리케이션을 클러스터에 배포, 문제 해결, 클러스터 리소스 관리

# 쿠버네티스 대시보드 설치

- VM 환경
    - OS : CentOS 7
    - HDD : 20Gi
    - CPU : 2 Core
- `kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0/aio/deploy/recommended.yaml`
- 공식문서에서 최신버전을 설치하는 것이 좋다.
    - [https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/)

```bash
## 쿠버네티스 대시보드 설치
[root@localhost ~]# [root@node1 cephfs]# kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0/aio/deploy/recommended.yaml
namespace/kubernetes-dashboard created
serviceaccount/kubernetes-dashboard created
service/kubernetes-dashboard created
secret/kubernetes-dashboard-certs created
secret/kubernetes-dashboard-csrf created
secret/kubernetes-dashboard-key-holder created
configmap/kubernetes-dashboard-settings created
role.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrole.rbac.authorization.k8s.io/kubernetes-dashboard created
rolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
deployment.apps/kubernetes-dashboard created
service/dashboard-metrics-scraper created
deployment.apps/dashboard-metrics-scraper created

## 대시보드 네임스페이스 확인
[root@localhost ~]# kubectl get pod -A
NAMESPACE              NAME                                            READY   STATUS     RESTARTS   AGE
calico-system          calico-kube-controllers-69fbbf7967-wk5sd        0/1     Pending    0          17s
calico-system          calico-node-ztd2g                               0/1     Init:1/2   0          17s
calico-system          calico-typha-75c5fd9698-bvqs5                   1/1     Running    0          18s
kube-system            coredns-f9fd979d6-5fldt                         0/1     Pending    0          7m17s
kube-system            coredns-f9fd979d6-ggl2r                         0/1     Pending    0          7m17s
kube-system            etcd-localhost.localdomain                      1/1     Running    0          7m27s
kube-system            kube-apiserver-localhost.localdomain            1/1     Running    0          7m27s
kube-system            kube-controller-manager-localhost.localdomain   1/1     Running    0          7m27s
kube-system            kube-proxy-hcbhk                                1/1     Running    0          7m17s
kube-system            kube-scheduler-localhost.localdomain            1/1     Running    0          7m27s
kubernetes-dashboard   dashboard-metrics-scraper-7b59f7d4df-qbrz6      0/1     Pending    0          74s
kubernetes-dashboard   kubernetes-dashboard-74d688b6bc-9mlxk           0/1     Pending    0          74s
tigera-operator        tigera-operator-b96747c7d-bt5s4                 1/1     Running    0          26s

## 클러스터 정보 확인
[root@localhost ~]# kubectl cluster-info
Kubernetes master is running at https://172.25.29.187:6443
KubeDNS is running at https://172.25.29.187:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

대시보드에 접근 방법은 총 3가지가 있으며 차례대로 `Proxy`, `NodePort`, `API Server` 순으로 진행해보겠다.

# Proxy를 이용한 세팅 방법

- 로컬호스트에서만 접속 가능
- `kubectl proxy --port[접속포트] --address=[대시보드 URL] --accept-hosts='^*$' &`

```bash
[root@localhost ~]# kubectl proxy --port=8001
[root@localhost ~]# Starting to serve on 127.0.0.1:8001
```

[http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login)

(접속은 가능하지만 로그인은 안된다는 것을 확인할 수 있음) 

![/assets/img/dashboard.png](/assets/img/dashboard.png)

- Kubernetes Login 인증키 생성 (Token 사용 방법)

```bash
## serviceaccount 생성
[root@localhost ~]# cat <<EOF | kubectl create -f -
>  apiVersion: v1
>  kind: ServiceAccount
>  metadata:
>    name: admin-user
>    namespace: kube-system
> EOF
serviceaccount/admin-user created

## ClusterRoleBinding 생성
[root@localhost ~]# cat <<EOF | kubectl create -f -
>  apiVersion: rbac.authorization.k8s.io/v1
>  kind: ClusterRoleBinding
>  metadata:
>    name: admin-user
>  roleRef:
>    apiGroup: rbac.authorization.k8s.io
>    kind: ClusterRole
>    name: cluster-admin
>  subjects:
>  - kind: ServiceAccount
>    name: admin-user
>    namespace: kube-system
> EOF
clusterrolebinding.rbac.authorization.k8s.io/admin-user created

## 사용자 계정의 토큰을 대시보드에 입력
[root@localhost ~]# kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
Name:         admin-user-token-994zc
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: admin-user
              kubernetes.io/service-account.uid: 302f8d02-9016-4e33-919b-f6bad094d143

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1066 bytes
namespace:  11 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IjZnMVU4d2lVOGhCdHg1ZWRlR1FST0pNMXJ3WXFFN3ktWnc0ZlhtOGlsSFUifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLTk5NHpjIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIzMDJmOGQwMi05MDE2LTRlMzMtOTE5Yi1mNmJhZDA5NGQxNDMiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.lMyKyDNP7KUNgfVv70Ox-QtlbQnNXl1XM6hBQXitSDWZq7Crn0w8PUoqT089OHs7Thmf4E6jYwr1GC8467lEMe-GRJ378RACKBjA_l9o76CibTV2jEeBGJ4f7rWUwD3SUNsZUuBpZATZl4BIgu4dpSLzoEMtc3mTvRM3ag-J7qntWEBkVgvYOJq0q-H6p5lrEdobjIX9j_Zeb9exstHD0VeKMrOIUMfwL2-qk7ofRrkTSiulmPspzv6sSv0_8l0Hqkr16ggO78wTxAokc0_C4V1I1C-cnNy-KUOW07ZgC16TOdGBgXhptqi0K4949p7lDShu5YG2Bqh7r2x2J1yRJQ
```

- 토큰으로 로그인 처리 (로컬호스트 기준)

![/assets/img/dashboard1.png](/assets/img/dashboard1.png)

# NodePort를 이용한 세팅 방법

- NodePort로 접속하기 위해서는 쿠버네티스 대시보드의 설정을 변경해야함.

```bash
## 쿠버네티스 대시보드 설정 변경
kubectl -n kubernetes-dashboard edit service kubernetes-dashboard

# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"labels":{"k8s-app":"kubernetes-dashboard"},"name":"kubernetes-dashboard","namespace":"kubernetes-dashboard"},"spec":{"ports":[{"port":443,"targetPort":8443}],"selector":{"k8s-app":"kubernetes-dashboard"}}}
  creationTimestamp: "2020-09-16T01:58:42Z"
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
  resourceVersion: "1231"
  selfLink: /api/v1/namespaces/kubernetes-dashboard/services/kubernetes-dashboard
  uid: 1706f4b9-439a-4a91-8520-9de11005e71c
spec:
  clusterIP: 10.109.32.134
  ports:
  - port: 443
    protocol: TCP
    targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard
  sessionAffinity: None
  type: ClusterIP ## 이 부분을 NodePort로 변경
status:
  loadBalancer: {}

## 변경된 내용 확인
[root@localhost ~]# kubectl -n kubernetes-dashboard get service kubernetes-dashboard
NAME                   TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)         AGE
kubernetes-dashboard   NodePort   10.109.32.134   <none>        443:30186/TCP   107m

```

# API Server를 이용한 세팅 방법

- 가장 효과적인 방법 (외부에서 접근 가능)
- 인증서를 생성하고 클라이언트 브라우저에 적용하여 접근

```bash
## .kube/config 파일의 client certificate와 client 키를 추출하여 kubecfg.crt와 kubecfg.key 파일 생성
[root@node1 ~]# grep 'client-certificate-data' ~/.kube/config | head -n 1 | awk '{print $2}' | base64 -d >> kubecfg.crt
[root@node1 ~]# cat kubecfg.crt
-----BEGIN CERTIFICATE-----
MIIDEzCCAfugAwIBAgIIcr2D9qvsSBwwDQYJKoZIhvcNAQELBQAwFTETMBEGA1UE
AxMKa3ViZXJuZXRlczAeFw0yMDA5MTYwNDI0MDVaFw0yMTA5MTYwNDI0MDdaMDQx
FzAVBgNVBAoTDnN5c3RlbTptYXN0ZXJzMRkwFwYDVQQDExBrdWJlcm5ldGVzLWFk
bWluMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5f6Mn0LMYlvnwghv
M2638uSwOFRlaIEhgnyB7+KI9XvhesQuEJB/+8wEILutuxq0wA95MCVSxMFgXKB7
h9/VJwxINFg//vKSESzBeHESkMbncFfC2sUNoXa1sHCDKlKAWPEbUeg+cgo0E7R/
EdxCbx9KXCDLr3W17RoR99/Y+2HABQrfWMV8K61HJ3tZu084rd1Lt4gh6kinJJXJ
gJRBX3wRMQ0hIVMhYTGqDiT7nxTa69zSTM3Sz64xoB19WxRDdFw0fc9g/qE4NWW6
otAuP1+phwpb8gwtpBCdsLVw9xyOSFaMj9RGpI9dD/31v5zK1WZj0ZWUniEO7X2D
bgq+7wIDAQABo0gwRjAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYBBQUH
AwIwHwYDVR0jBBgwFoAUzS0xveexOOV9pTixafrsi+MFiIEwDQYJKoZIhvcNAQEL
BQADggEBAHH3PDVCxPugy5ZaqIVJRF1chtAcctVt6slHxgKrOlO7kkHGU6srEG8R
QPdsXKaqBBlZG4Qir+Gf/9l83zZuR8aNZDTea6O96Y8Aef6JS396z6JV7118d311
gS6USLER+fsG/dyOGw0y3/DYPbyIVzpuGQ607KbaG55m6vainNVrKbqbXn86Lraz
Yy1wFZRTJ/rnVGpBscPY6AV3ITXjvGkDNGnQ2bxjHLbXyqYAgMN/dkjWb8z0IDh5
RRekqIY2PBRncHq6zWS2Xak85Rm7h3Ka9QYUugHBZXROleizG1CCD3Gf7XEzRiaU
faF32UNPKheJ1CCSstaTwiH891kPGhs=
-----END CERTIFICATE-----

[root@node1 ~]# grep 'client-key-data' ~/.kube/config | head -n 1 | awk '{print $2}' | base64 -d >> kubecfg.key
[root@node1 ~]# cat kubecfg.key
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA5f6Mn0LMYlvnwghvM2638uSwOFRlaIEhgnyB7+KI9XvhesQu
EJB/+8wEILutuxq0wA95MCVSxMFgXKB7h9/VJwxINFg//vKSESzBeHESkMbncFfC
2sUNoXa1sHCDKlKAWPEbUeg+cgo0E7R/EdxCbx9KXCDLr3W17RoR99/Y+2HABQrf
WMV8K61HJ3tZu084rd1Lt4gh6kinJJXJgJRBX3wRMQ0hIVMhYTGqDiT7nxTa69zS
TM3Sz64xoB19WxRDdFw0fc9g/qE4NWW6otAuP1+phwpb8gwtpBCdsLVw9xyOSFaM
j9RGpI9dD/31v5zK1WZj0ZWUniEO7X2Dbgq+7wIDAQABAoIBAQC9SuMMFRtIfOHj
VbPIPgER3VyYEAYim90rmzQKboVQnfP3ac2L/pIHeGORWUZkr1dCl7mjgaR8obeg
pMjnDLdPWxF2W4fYWmcT0aUubsnb9Ij5cpHCItrUIHLrU77wr1RJX6+fmykCDRnN
egn3djQLZ1J5PtjFgXkJOyK8wzS/t6Vjnm34/+KGKvSISNQtm1IzvpfFP+6yNb3M
i3Rkq0sFnt/j123/xndic3SdAh0FfjP+uGNofWzr1Y7aiS0q4gMFwkSq+U364hk0
yS4r3Kx7O9XtBKZYifmSvpAwSNRtpU5oRFaYDAHvK2H+UDTWQR8mOtRSGmVrcTLI
5WjWRNGZAoGBAPzR8XgiyueyFTJYhGCXaP7zoZ5KwRIz6E9453IFG/PHDQwbFMx0
+HcZLFr864DDXqMUwsgTcc4bPx8DU3+WN4yhVb+90qjVkbtOUw6A07yW95aK5aWa
Ok2n2NQect7ONT/I0+pvv7DSRgGB4AF4Yy4YBv8PQiiUdC2gYMjaK+MjAoGBAOjj
G/o9AivXl9THFGpzi8jhDDbHIWr9H9j+7SvBgUF2/j2Vs0tyJBk1JqeYGIcP9edc
Z1bOyCH0LS8d+lAQ7VXgdI8Q4T/Iu7WTjc9qQq9FrTbxLVuieED2spL5D36n4cvQ
8fL0UFHcdLjU7FQIjFgqmEN18/Oie42CIn8hJQfFAoGBAMYeS0imkzTgA+ZRIWOE
I15vUz51PDlkfe8RQuXCBTaSzLGo4zKZkz/ZdT3UJ0TfVOEdWsppGmy2Q0+tTpiU
AfHtWAIK4fM2cZ5DcajS4ZpO/7R0IiQU6Q2Ds9H+Dmx1UZsraI21hpUtInj56q2c
RrSPVaQ4s9KTCzvaCx46gdvbAoGBALp4ln9AeEuYfcbufIdb61I1+CyoNzbOZMDA
JjFB6Hf9ikbPZdeEFilk6IWLACCtA+1zjH7yZUbil4dBjpqrYw2/AjVHg8QpuzsB
YavxXmGu/amfZP0ZUwZZQdTyvZhhXidvLzukqedSCNeyDWSfz5gMywxBFss+j4VX
7L00Uc0tAoGAZ147wKkgH8hxvjvdyqyDTtyI9a0e7Zp5f0OmRl0CtDoGt8AmNmlw
OAhsbXBatguL0XAvivgfMhopAM10PrgCR4FD/Mm0iGz1AUIB+OKlRpG/fxiNVwcz
/pQ9A73XS5nFJfRF8aEjPP366cl0Wk7uMNnUyo5x/A5FXeQxS2WAxmg=
-----END RSA PRIVATE KEY-----

## 이 키들을 기반으로 인증서 파일 생성 (비밀번호도 설정)
[root@node1 ~]# openssl pkcs12 -export -clcerts -inkey kubecfg.key -in kubecfg.crt -out kubecfg.p12 -name "kubernetes-admin"
Enter Export Password:
Verifying - Enter Export Password:

## 키 생성 확인 (kubecfg.p12가 있음을 확인할 수 있다)
root@node1 ~]# ls
anaconda-ks.cfg       kubecfg.key  다운로드  비디오  스크린샷, 2020-09-16 12-58-12.png
initial-setup-ks.cfg  kubecfg.p12  문서      사진    음악
kubecfg.crt           공개         바탕화면  서식

## kubecfg.p12 파일과 /etc/kubernetes/pki/ca.crt 2개의 파일을 외부로 옮겨준다.
## 필자는 메일로 보내보려 했으나 잘 안되서 슬랙으로 보냈다.

## ca.crt 파일과 따로 찾기 번거로울 것 같아서 홈디렉토리로 복사한 후 슬랙으로 보냈다.
[root@node1 ~]# cd /etc/kubernetes/pki/
[root@node1 pki]# ls
apiserver-etcd-client.crt     apiserver.crt  etcd                    front-proxy-client.key
apiserver-etcd-client.key     apiserver.key  front-proxy-ca.crt      sa.key
apiserver-kubelet-client.crt  ca.crt         front-proxy-ca.key      sa.pub
apiserver-kubelet-client.key  ca.key         front-proxy-client.crt
[root@node1 pki]# cp ca.crt ~/
```

- 필자의 경우 `kubecfg.p12` 파일과 `/etc/kubernetes/pki/ca.crt` 2개의 파일을 D드라이브의 cert라는 폴더를 만들어서 옮겨놓음.
- 호스트 컴퓨터는 Window10 이므로 명령 프롬프트 창 관리자 권한으로 띄워서 인증서 적용

```bash
## 관리자 권한으로 명령프롬프트를 띄움
## 루트 인증 기관 인증서 적용
C:\WINDOWS\system32>certutil.exe -addstore "Root" D:\cert\ca.crt
Root "신뢰할 수 있는 루트 인증 기관"
서명이 공개 키와 일치합니다.
"kubernetes" 인증서가 저장소에 추가되었습니다.
CertUtil: -addstore 명령이 성공적으로 완료되었습니다.

## 개인용 인증서 적용
C:\WINDOWS\system32>certutil.exe -p [인증키 생성시 PW] -user -importPFX D:\cert\kubecfg.p12
"kubernetes-admin" 인증서가 저장소에 추가되었습니다.

CertUtil: -importPFX 명령이 성공적으로 완료되었습니다.

## 적용된 인증서 확인
C:\WINDOWS\system32>certmgr.msc
```

정상적으로 발급이 되었다면 아래의 화면처럼 개인용 인증서와 기관용 인증서를 확인할 수 있다.

- 개인용 인증서

![/assets/img/dashboard2.png](/assets/img/dashboard2.png)

- 신뢰할 수 있는 루트 인증 기관용 인증서

![/assets/img/dashboard3.png](/assets/img/dashboard3.png)

- 대시보드에 접근 : https://[마스터 IP]:6443/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login
- 필자의 경우 : [https://172.25.22.153:6443/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login](https://172.25.22.153:6443/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login)
- 아래와 같이 인증서 여부를 확인함.

![/assets/img/2020-09-16_16h10_20.png](/assets/img/2020-09-16_16h10_20.png)

- `kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')` 명령어를 통해 이전에 발급받은 토큰을 확인

```bash
## 토큰을 확인하고 호스트 컴퓨터에서 입력하여 로그인 해본다.
[root@node1 pki]# kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
Name:         admin-user-token-rxq76
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: admin-user
              kubernetes.io/service-account.uid: 000b89cc-5d60-435c-9c46-ec057620f806
Type:  kubernetes.io/service-account-token
Data
====
namespace:  11 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IkNkWDM2dG1fQWp0WU1ncUlHZXNaa05PQ0taV3M1UF9lNEtRMXZ4MWlhQVUifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLXJ4cTc2Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIwMDBiODljYy01ZDYwLTQzNWMtOWM0Ni1lYzA1NzYyMGY4MDYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.V-tHFDfhz1p5982M2HzYooGS2AeNjaEM4DvLDMvbxTuGdFPH1v5_i1-CN6z9Ql3Wg7KvSOroACB53ZBqNmUuhdOAfU4kQY_IacLJSVYtCN6KCt9mwrYmPh9uYBBd_33aK4gTUpyoC139eHfp7dt2BQoh7K_c_DjvggmuPhnBH6BG9VO0kJElqJ09a6UqaRB6EFNKABSyKOewndNm01fOhlcjn5WKR6-s01HnC_laDBCYIC8b8hJ3_EztqMWAi3ki4ck2hRcadnwNeZLJvjnWWf54Nf-ue8gGIPeDEK7m0Fcrme3g4-VQiElEFHcu4EN7-dJxN0OcwNkIjYQk2zyUEA
ca.crt:     1066 bytes
```

- 아래와 같이 정상적으로 로그인이 되면 성공

![/assets/img/2020-09-16_16h16_27.png](/assets/img/2020-09-16_16h16_27.png)
