---
title: React Hooks 활용 (useState 부터 useReducer까지)
layout: post
date: '2020-10-19 17:32:00 +0300'
description: React Hooks 활용 (useState 부터 useReducer까지)
img: null
fig-caption: null
tags:
- react
- reacthooks
- 리액트훅
- 리액트훅예제
---

# React Hooks 이란?

- 함수형 컴포넌트에서도 클래스형 컴포넌트의 기능을 사용할 수 있게 하는 기능
- 클래스형 컴포넌트의 한계를 극복하기 위해 사용 (생명 주기 메서드, 로직 재사용)

## useState

- 함수형 컴포넌트에서 상태값 관리

### useState를 사용한 턱걸이 갯수 카운터

```jsx
//useState import
import React, {useState} from 'react';

const App =()=> {
  //count라는 상태값 관리 변수 선언, 초기값 0
  const [count, setCount] = useState(0); 
  
	//count 변수 1 증가 함수
	const plus =()=>{
    setCount(count+1);
  }
  //count 변수 1 감소 함수
  const minus =()=>{
    setCount(count-1);
  }

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={minus}>-</button>
      <button onClick={plus}>+</button>
    </div>
  );
}
```

![/assets/img/2020-10-19_15h10_20.png](/assets/img/2020-10-19_15h10_20.png)

```jsx
import React, {useState} from 'react';

const App =()=> {
  
  const [count, setCount] = useState(0); 
  const [name, setName] = useState('미입력');
  const [age, setAge] = useState('미입력');

  const plus =()=>{
    setCount(count+1);
  }
  const minus =()=>{
    setCount(count-1);
  }
  
  return (
    <div>
      이름 : <input type="text" onChange={e=>setName(e.target.value)}/>
      나이 : <input type="text" onChange={e=>setAge(e.target.value)}/>
      <h1>이름 : {name}</h1>
      <h1>나이 : {age}</h1>
      <h1>턱걸이 갯수 카운터 : {count}</h1>
      <button onClick={minus}>-</button>
      <button onClick={plus}>+</button>
    </div>
  );
}

export default App;
```

![/assets/img/2020-10-19_15h30_25.png](/assets/img/2020-10-19_15h30_25.png)

### useState를 사용한 턱걸이 갯수 카운터(이름, 나이 입력값 추가)

```jsx
import React, {useState} from 'react';

const App =()=> {
  
  const [count, setCount] = useState(0); 
  //const [name, setName] = useState('미입력');
  //const [age, setAge] = useState('미입력');
  //useState 하나로 여러개의 상태값 관리
  const [state, setState] = useState({name:'미입력', age:'미입력'});

  const plus =()=>{
    setCount(count+1);
  }
  const minus =()=>{
    setCount(count-1);
  }
  
  return (
    <div>
      //스프레드 연산자 사용해서 값 세팅
      이름 : <input type="text" onChange={e=>setState({...state, name: e.target.value})}/>
      나이 : <input type="text" onChange={e=>setState({...state, age: e.target.value})}/>
      <h1>이름 : {state.name}</h1>
      <h1>나이 : {state.age}</h1>
      <h1>턱걸이 갯수 카운터 : {count}</h1>
      <button onClick={minus}>-</button>
      <button onClick={plus}>+</button>
    </div>
  );
}

export default App;
```

## useEffect

- 함수형 컴포넌트 생명주기 관리
- useEffect를 사용하면 생명주기 메서드를 한곳으로 모을 수 있어서 가독성이 좋음

### useEffect를 사용한 JSON 리스트 데이터 출력

```jsx
//useEffect import
import React, {useState, useEffect} from 'react';

const App =()=> {
  //상태관리 변수 list 선언 및 초기화
  const [list, setList] = useState([]);
  //생명주기 함수 useEffect 사용
  useEffect(()=>{
    //해당 url에서 json 데이터를 가져옴
    fetch('https://jsonplaceholder.typicode.com/posts')
    .then((data)=>{
        return data.json();
    })
    .then(commits=>{
      //각 리스트를 li태그에 감싸서 list 상태 변수에 저장
      const commitList = commits.map((data)=>{
        return <li key={data.id}>{data.title} : {data.body}</li>;
      });
      setList(commitList)
    })
    .catch(err=>console.log(err));
  },[]); //api 통신을 최초에 1회만 하도록 함. 
         //다른 변수를 넣는다면 변수값 변경에 따라 api 호출됨

  return (
    <div>
			{//list 상태변수 출력}
      {list}
    </div>
  );
}

export default App;
```

![/assets/img/2020-10-19_16h19_57.png](/assets/img/2020-10-19_16h19_57.png)

## Custom Hook

- 훅의 이름은 가독성을 위해 use로 시작하는 것이 좋음
- 리액트가 제공하는 훅을 이용해서 새로운 훅 생성 가능

### 창 너비, 높이를 관리하는 커스텀 훅 생성

`App.js`

```jsx
import React, {useState, useEffect} from 'react';
import {useWindow} from './hooks'

const App =()=> {
  const [list, setList] = useState([]);
  const {width,height} = useWindow();
  useEffect(()=>{
    fetch('https://jsonplaceholder.typicode.com/posts')
    .then((data)=>{
        return data.json();
    })
    .then(commits=>{
      const commitList = commits.map((data)=>{
        return <li key={data.id}>{data.title} : {data.body}</li>;
      });
      setList(commitList)
    })
    .catch(err=>console.log(err));
  },[]);

  return (
    <div>
      <h1>width:{width}, height:{height}</h1>
      {list}
    </div>
  );
}

export default App;
```

`hooks.js`

```jsx
import {useState, useEffect} from 'react';

export function useWindow(){
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    useEffect(()=>{
      const onWidthResize = () => setWidth(window.innerWidth);
      const onHeightResize = () => setHeight(window.innerHeight);
      window.addEventListener('resize', onWidthResize);
      window.addEventListener('resize', onHeightResize);
      return () => {
          window.removeEventListener('resize', onWidthResize);
          window.removeEventListener('resize', onHeightResize);
      }
    },[])
    return {width,height};
}
```

![/assets/img/2020-10-19_17h10_24.png](/assets/img/2020-10-19_17h10_24.png)

## useContext

- Consumer 컴포넌트 없이 부모 컴포넌트로부터 전달되어 콘텍스트 데이터 사용 가능

`App.js`

```jsx
import React from 'react';
import {UserProvider} from "./User";

import Display from './Display';

const App = () => {
    return (
        <UserProvider>
            <Display/>
        </UserProvider>
    );
};

export default App;
```

`User.js`

```jsx
import React, {useState} from 'react';

const UserContext = React.createContext(null);

const UserProvider = ({children}) => {
    const [name, setName] = useState('hamletshu');

    const user = {
        name, setName
    };

    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
};

export {
    UserProvider,
    UserContext
};
```

`Display.js`

```jsx
import React, {useContext} from 'react';
import {UserContext} from "./User";

const Display = () => {
    const {name, setName} = useContext(UserContext);

    return (
        <>
            <div>Name : {name}</div>
        </>
    )
};

export default Display;
```

![/assets/img/2020-10-19_18h53_02.png](/assets/img/2020-10-19_18h53_02.png)

## useRef

- DOM 요소 접근시 사용

`App.js`

```jsx
import React, {useRef, useState} from 'react';

const App = () => {
  const input = useRef(null);
  const [output, setOutput] = useState('');

  const inputText=()=>{
    setOutput(input.current.value);
  }

    return (
        <>
          <input ref={input} type="text"></input>
          <button onClick={inputText}>입력</button>
          <div>{output}</div>
        </>
    );
};

export default App;
```

![/assets/img/2020-10-19_19h03_10.png](/assets/img/2020-10-19_19h03_10.png)

## useMemo

- 이전 값을 기억해서 성능을 최적화 하는 용도로 사용
- 반환값 재활용
- 첫번째 매개변수는 함수 `computeExpensiveValue(a, b)` : 반환한 값 기억
- 두번째 매개변수는 배열 `[a, b]` : 배열의 값이 변경되지 않으면 반환된 값을 재사용

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

## useCallback

- 이전 값을 기억해서 성능을 최적화 하는 용도로 사용
- 불필요한 렌더링 발생을 줄여 렌더링 성능 향상 가능
- 콜백의 의존성이 바뀌었을 때만 변경됨

```jsx
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

## useReducer

- 컴포넌트 상태값 관리 (Redux의 Reducer 처럼 관리)
- `contextAPI` 를 사용하면 이벤트 함수를 손쉽게 전달 가능

`App.js`

```jsx
import React, {useReducer} from 'react';
import UseReduxTest from './UseReduxTest';

export const AppDispatch = React.createContext(null);

const App = () => {
  const initialState = {count: 0};
  //useReducer에 이벤트 함수들을 등록
  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return {count: state.count + 1};
      case 'decrement':
        return {count: state.count - 1};
      default:
        throw new Error();
    }
  }
	//useReducer(함수, 초기값);
  const [state, dispatch] = useReducer(reducer, initialState);
    return (
      <>
        Count: {state.count}
        <div>
          <button onClick={() => dispatch({type: 'decrement'})}>-</button>
          <button onClick={() => dispatch({type: 'increment'})}>+</button>
        </div>
        <AppDispatch.Provider value={dispatch}>
          <UseReduxTest/>
        </AppDispatch.Provider>
      </>
    );
};

export default App;
```

`UseReducerTest.js`

```jsx
import React, {useContext} from 'react';
import {AppDispatch} from './App';

const UseReducerTest = () => {
    //useContext를 사용하여 useReducer에 등록한 이벤트 함수들을 가져옴
    const dispatch = useContext(AppDispatch);
    return (
      <>
        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        <button onClick={() => dispatch({type: 'increment'})}>+</button>
      </>
    );
};

export default UseReducerTest;
```

- 아래의 버튼도 동일하게 작동하는 것을 확인할 수 있다.

![/assets/img/2020-10-19_19h43_53.png](/assets/img/2020-10-19_19h43_53.png)
