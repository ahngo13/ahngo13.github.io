---
title: Redux 미들웨어(middleware) 활용 (redux-logger, redux-thunk)
layout: post
date: '2020-10-21 17:32:00 +0300'
description: Redux 미들웨어(middleware) 활용 (redux-logger, redux-thunk)
img: null
fig-caption: null
tags:
- redux
- 리덕스
- reduxmiddleware
- 리덕스미들웨어
- redux-logger
- redux-thunk
---

우연히 `React를 다루는 기술` 저자 분의 블로그를 발견해서 공부하게 되었다. 국비과정을 수강했을 때 React 책이 아쉬워서 저 책을 사야되나 생각했었는데 추후에 기회가 된다면 구입하도록 해야겠다. 필요한 부분만 잘라서(+@) 공부할 예정이므로 조금 더 자세한 내용이 필요하다면 글의 최하단 URL을 참고하기 바란다.

# 미들웨어(Middleware)란?

- dispatch되어서 reducer에 전달 하기전에 사전에 지정된 작업들을 수행하는 역할
- action → middleware → reducer

## 카운터 프로젝트 clone

- 간단하게 카운터가 되는 프로젝트를 클론해서 실습하였다. 새로 프로젝트를 만들 수도 있겠지만 불필요한 시간을 소비하게 될까봐 복제하였다. 복제를 했다면 Javascript 라이브러리를 설치하고 실행시켜서 정상적으로 동작되는지 확인한다.

```bash
## git repository 복제
git clone https://github.com/vlpt-playground/redux-starter-kit.git

## 복제한 폴더로 이동
cd redux-starter-kit

## 라이브러리 설치
npm i

## 프로젝트 실행
npm start
```

![/assets/img/2020-10-21_10h29_55.png](/assets/img/2020-10-21_10h29_55.png)

## 미들웨어 만들기

미들웨어를 직접 만들어서 쓰는 경우는 거의 없다고 하지만 이런 느낌이구나를 파악하기 위해 따라서 한번 만들어보았다. 간단한 로그를 찍어주는 미들웨어이다. 로그를 찍어주는 미들웨어를 만들고 `store.js` 에 미들웨어를 적용하여 테스트 하였다.

`src/lib/loggerMiddleware.js`

```jsx
const loggerMiddleware = store => next => action => {
    //store 객체 안에 있는 state값 가져오기
    console.log('state:', store.getState());
    
    //action 출력
    console.log('action:', action);

    //액션을 다음 미들웨어나 리듀서로 넘기기
    const result = next(action);

    //액션 처리 후  store 객체 안의 state값 가져오기
    console.log('next state:', store.getState());

    //store.dispatch(ACTION_TYPE)의 결과로 설정됨
    return result;
}

export default loggerMiddleware;
```

`src/store.js`

```jsx
import { applyMiddleware, createStore } from 'redux';
import modules from './modules';
//export한 미들웨어를 import 시켜준다.
import loggerMiddleware from './lib/loggerMiddleware'

//applyMJiddleware 함수를 통해 미들웨어를 추가해준다. 여러 개도 ,로 구분해서 넣을 수 있다.
const store = createStore(modules, applyMiddleware(loggerMiddleware))

export default store;
```

크롬에서 개발자도구를 띄워놓고 console창에 log가 잘 찍히는지 확인한다.

![/assets/img/2020-10-21_10h48_55.png](/assets/img/2020-10-21_10h48_55.png)

## redux-logger 적용하기

아까 말했듯 미들웨어를 만들어서 쓰는 경우는 별로 없다하니 이제 가져다 쓰는 방법을 확인할 차례이다. 물론 미들웨어 마다 가져다 쓰는 방법은 다를 수 있으니 쓰는 방법은 공식문서를 통해서 확인하기 바란다. 이번에 적용할 미들웨어는 redux-logger인데 Redux DevTool을 브라우저에 설치해서 사용하고 있는 사람이라면 쓸 필요가 없어서 사용하지 못하는 환경에서 쓰면 된다고 한다.

### redux-logger 설치

```bash
npm i redux-logger
```

### redux-logger 적용

라이브러리 검색이나 사용하는 방법이 궁금하다면 [https://www.npmjs.com/package/redux-logger](https://www.npmjs.com/package/redux-logger) 사이트에 들어가서 확인해보기 바란다. 왜 아래와 같이 사용을 했는지 알 수 있다.

![/assets/img/2020-10-21_10h59_54.png](/assets/img/2020-10-21_10h59_54.png)

`src/store.js`

```jsx
import { applyMiddleware, createStore } from 'redux';
import modules from './modules';
//설치한 redux-logger 미들웨어 import
import {createLogger} from 'redux-logger';

//위의 문서를 보니 커스텀 옵션을 추가할 때 아래와 같이 선언해서 사용하는 거라고 한다.
const logger = createLogger();
//applyMJiddleware 함수를 통해 미들웨어를 추가해준다. 여러 개도 ,로 구분해서 넣을 수 있다.
const store = createStore(modules, applyMiddleware(logger));

export default store;
```

직접 만든 미들웨어보다 훨씬 더 아름답게(?) 나오는 것을 확인할 수 있다.

![/assets/img/2020-10-21_10h56_52.png](/assets/img/2020-10-21_10h56_52.png)

## redux-thunk 적용하기

비동기 작업을 처리할 때 가장 많이 사용하는 미들웨어라고 한다. (redux-saga도 비슷한 미들웨어인가보다) redux 공식 메뉴얼에도 나온 미들웨어라고 하니 한번 써보도록 하자.

redux-thunk가 뭐하는 미들웨어인지는 알고 써야하므로 그것 먼저 정리하도록 하겠다. `thunk` 는 객체 대신 함수를 생성하는 액션 생성 함수를 작성할 수 있게 해준다고 한다. 그게 무슨 소리냐고?

```jsx
//일반적으로 action을 생성하는 생성자는 아래와 같이 표현되는데
//이 생성자로는 액션이 몇초 뒤에 생성하거나 상태에 따라 액션을 무시하게 하기 어렵다
const actionCreator = (payload) => ({action: 'ACTION', payload});
```

하지만 thunk 미들웨어를 쓰면 가능하다는 이야기다. 그럼 한번 적용해보자!

`src/store.js`

- store 객체에 미들웨어 추가

```jsx
import { applyMiddleware, createStore } from 'redux';
import modules from './modules';
import {createLogger} from 'redux-logger';
//redux-thunk 미들웨어 import
import ReduxThunk from 'redux-thunk'; 

const logger = createLogger();
//redux-logger 미들웨어 뒤에 redux-thunk 추가
const store = createStore(modules, applyMiddleware(logger, ReduxThunk));

export default store;
```

`src/modules/counter.js`

- 1초 뒤 counter 증가(delayIncrement), 감소(delaydecrement) 함수 추가

```jsx
import { handleActions, createAction } from 'redux-actions';

const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

export const increment = createAction(INCREMENT);
export const decrement = createAction(DECREMENT);

export const delayIncrement = () => dispatch => {
    //1초 뒤에 increment dispatch 호출
    setTimeout(()=>{
        dispatch(increment())
    },1000);
}

export const delayDecrement = () => dispatch => {
    //1초 뒤에 decrement dispatch 호출
    setTimeout(()=>{
        dispatch(decrement())
    },1000);
}

export default handleActions({
    [INCREMENT]: (state, action) => state + 1,
    [DECREMENT]: (state, action) => state - 1,
}, 0);
```

`src/App.js`

- 1초 뒤 증가, 감소 버튼 추가

```jsx
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as counterActions from './modules/counter';

class App extends Component {
    render() {
        const { CounterActions, number } = this.props;

        
        return (
            <div>
                <h1>{number}</h1>
                <button onClick={CounterActions.increment}>+</button>
                <button onClick={CounterActions.decrement}>-</button><br/>
								{//버튼 추가}
                <button onClick={CounterActions.delayIncrement}>1초 뒤 증가</button>
                <button onClick={CounterActions.delayDecrement}>1초 뒤 감소</button>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        number: state.counter
    }),
    (dispatch) => ({
        CounterActions: bindActionCreators(counterActions, dispatch)
    })
)(App);
```

아래의 버튼을 눌러보아 정상적으로 작동하는지 확인한다. 버튼을 클릭하면 1초 뒤에 증가하고 1초 뒤에 감소하여야 한다. setTimeout 함수를 통해 1초씩 딜레이 됨을 확인할 수 있고 log에도 aciton에 금방전에 만들었던 함수가 들어있는 것을 확인할 수 있다.

![/assets/img/2020-10-21_12h26_18.png](/assets/img/2020-10-21_12h26_18.png)

## redux-thunk를 활용한 웹요청 보내기

### axios 라이브러리 설치

- axios는 Promise 기반 HTTP Client이다. Promise 객체에 대해 이해가 부족하다면 아래의 글을 참조하기 바란다.

[https://ahngo13.github.io/javascript-promise/](https://ahngo13.github.io/javascript-promise/)

```bash
npm i axios
```

### 웹요청 보내기 적용

`modules/post.js`

[https://jsonplaceholder.typicode.com/posts/](https://jsonplaceholder.typicode.com/posts/) 는 json 데이터 샘플이 있는 페이지이다. 뒤에 postId값을 전달하면 postId 값에 맞는 글에 대한 json 데이터도 볼 수가 있다. 이를 활용해서 웹요청 보내기 테스트를 해보았다.

```jsx
import { handleActions} from 'redux-actions';
//axios 라이브러리 import
import axios from 'axios';

//API 호출
function getPostAPI(postId){
    return axios.get(`https://jsonplaceholder.typicode.com/posts/${postId}`)
}

//대기중
const GET_POST_PENDING = 'GET_POST_PENDING';
//성공
const GET_POST_SUCCESS = 'GET_POST_SUCCESS';
//실패
const GET_POST_FAILURE = 'GET_POST_FAILURE';

export const getPost = (postId) => dispatch => {
    // API 요청을 알림 
    dispatch({type: GET_POST_PENDING});

    // 요청 시작
    // promise 객체를 return 해줘야 나중에 컴포넌트에서 호출 할 때 getPost().then(...) 사용가능
    return getPostAPI(postId).then(
        (response) => {
            // 요청이 성공했을 때, 서버 응답내용을 payload 로 설정하여 GET_POST_SUCCESS 액션을 디스패치
            dispatch({
                type: GET_POST_SUCCESS,
                payload: response
            })
        }
    ).catch(error => {
        // 에러가 발생시, 에러 내용을 payload 로 설정하여 GET_POST_FAILURE 액션을 디스패치
        dispatch({
            type: GET_POST_FAILURE,
            payload: error
        });
    })

}

//기본 State값 설정
const initialState = {
    pending: false,
    error: false,
    data: {
        title: '',
        body: ''
    }
}

export default handleActions({
    [GET_POST_PENDING]: (state, action) => {
        return {
            ...state,
            pending: true,
            error: false
        };
    },
    [GET_POST_SUCCESS]: (state, action) => {
        const { title, body } = action.payload.data;

        return {
            ...state,
            pending: false,
            data: {
                title, body
            }
        };
    },
    [GET_POST_FAILURE]: (state, action) => {
        return {
            ...state,
            pending: false,
            error: true
        }
    }
}, initialState);
```

`index.js`

- reducer에 모듈 추가

```jsx
import { combineReducers } from 'redux';
import counter from './counter';
import post from './post';

export default combineReducers({
    counter,
    post //새로 생성한 모듈
});
```

`App.js`

```jsx
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as counterActions from './modules/counter';
//post 모듈 import
import * as postActions from './modules/post';

class App extends Component {
    componentDidMount() {
        // 컴포넌트가 처음 마운트 될 때 현재 counter의 number를 postId로 사용하여
        // 포스트 내용 불러오기
        const { number, PostActions } = this.props;
        PostActions.getPost(number);
    }

    componentWillReceiveProps(nextProps) {
        const { PostActions } = this.props;

        // 현재 number와 새로 받을 number가 다를 경우에 요청 시도
        if(this.props.number !== nextProps.number) {
            PostActions.getPost(nextProps.number)
        }
    }

    render() {
        //props로 가져온 변수 추가 (number, post, error, loading)
        const { CounterActions, number, post, error, loading } = this.props;

        return (
            <div>
                <h1>{number}</h1>
                <button onClick={CounterActions.increment}>+</button>
                <button onClick={CounterActions.decrement}>-</button><br/>
                <button onClick={CounterActions.delayIncrement}>1초 뒤 증가</button>
                <button onClick={CounterActions.delayDecrement}>1초 뒤 감소</button>
                {//loading state값에 따라 로딩중 표시 }
								{ loading && <h2>로딩중...</h2>}
								{//삼항연산자 사용 에러발생시 에러발생! 출력, 에러 없을 경우 타이틀 출력}
                { error 
                    ? <h1>에러발생!</h1> 
                    : (
                        <div>
                            <h1>{post.title}</h1>
                            <p>{post.title}</p>
                        </div>
                    )}
            </div>
        );
    }
}

export default connect(
    //post, loading, error state값 추가
    (state) => ({
        number: state.counter,
        post: state.post.data,
        loading: state.post.pending,
        error: state.post.error
    }),
    //PostActions 추가
    (dispatch) => ({
        CounterActions: bindActionCreators(counterActions, dispatch),
        PostActions: bindActionCreators(postActions, dispatch)
    })
)(App);
```

이와 같이 수정을 하고 실행을 하면 최초 화면에서는 에러 발생(postId가 0이기 때문에 데이터가 존재하지 않음)하는 것을 알 수 있고 `+` 버튼을 눌러서 number를 증가시키면 아래와 같이 데이터의 title이 잘 나오는 것을 확인할 수 있다.

![/assets/img/2020-10-21_13h23_55.png](/assets/img/2020-10-21_13h23_55.png)

### 참고 사이트

[https://velopert.com/3401](https://velopert.com/3401)

[https://www.npmjs.com/package/redux-thunk](https://www.npmjs.com/package/redux-thunk)
