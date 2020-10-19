---
title: Javascript Promise 객체의 이해
layout: post
date: '2020-10-19 17:31:00 +0300'
description: Javascript Promise 객체의 이해
img: null
fig-caption: null
tags:
- javascript
- es6
- promise
- 프로미스
- 프로미스객체
---

# Promise 객체란?

- 비동기 상태를 값으로 다룰 수 있는 객체
- 비동기 프로그래밍을 동기 프로그래밍 방식으로 코드를 작성할 수 있음
- Javascript ES6에서는 프로미스 객체가 포함이 됨

# Promise 객체의 3가지 상태

- Pending : 결과 기다림
- fulfilled : 수행 정상 종료 (결과 값 O)
- rejected : 수행이 비정상적으로 종료

# Promise 생성 방법

```jsx
const promise1 = new Promise((resolve, reject)=>{});
const promise2 = Promise.reject('error message')
    .then(null, error => console.log(error));
const promise3 = Promise.resolve("1")
    .then(data => console.log(data));
```

# Promise 이용 방법

- `then` : 처리된 상태의 프로미스를 처리할 때 사용하는 메서드
- then 메서드를 여러번 사용 가능
- `onReject` 함수에서는 onResolve 함수에서 발생한 예외는 처리되지 않음. 따라서 `catch` 함수를 사용하는 것이 좋음
- `finally` 메서드는 가장 마지막에 사용되고 처리된 상태인 프로미스 데이터에 추가작업 할 때 사용

```jsx
// then 메서드 활용
Promise.resolve(1).then(data => console.log(data)); //1
Promise.reject('err').then(null, err => console.log(err)); //err

// 여러 번 사용
Promise.resolve(1)
.then(data => {
    console.log('then1 지나감');
    return 1
})
.then(data => {
    console.log('then2 지나감');
    return 1
})
.then(data => console.log(data)); //1

Promise.reject('err')
.then(()=> console.log('then1 지나감') , ()=> console.log('then2 지나감')) //then2 지나감
.then(()=> console.log('then3 지나감') , ()=> console.log('then4 지나감')) //then3 지나감

//onResolve 함수에서 발생한 예외는 처리되지 않으므로 catch 함수 권장
//catch 이후에도 then 사용 가능
Promise.resolve(1)
.then((data)=>{
    console.log(data);
    throw new Error ('error 발생');
})
.catch(error => {
    console.log(error);
    return 'error 로그 전달';
})
.then((log)=>{
    console.log(log);
})
.finally(()=>{
    console.log('final');
})
```

## Promise.all

- 여러 프로미스 객체를 병렬 처리할 때 사용
- 병렬로 코드를 작성하면 되지만 서로 의존성이 있다면 `Promise.all` 로 처리하는 것이 좋음

```jsx
const p1 = Promise.resolve(10);
const p2 = Promise.resolve(20);

// requestData().then(data => console.log(data));
//의존성이 없을 경우
p1.then((returnData) => {
    console.log(returnData);
});
p2.then((returnData) => {
    console.log(returnData)
});

//의존성이 있을 경우
Promise.all([p1, p2]).then(([returnData1,returnData2]) => {
    console.log(returnData1, returnData2);
});
```

## Promise.race

- 가장 빨리 처리된 프로미스를 가져올 때 사용

```jsx
function p1(){
    return fetch('sadf')
    .then(()=>{

    })
    .catch(err=> {return  ' 데이터 로딩 성공 '});
}

//1초 안에 데이터 로딩이 성공하면 then ' 데이터 로딩 성공' 출력, 실패하면 err 로그 출력
Promise.race([p1(), 
    new Promise((_,reject)=>{
        setTimeout(reject, 1000);
    }),
])
.then(data=>console.log(data))
.catch(err=>console.log(err));
```
