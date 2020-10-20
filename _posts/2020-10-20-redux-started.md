---
title: Redux의 주요 개념 및 용어 정리
layout: post
date: '2020-10-20 17:32:00 +0300'
description: Redux의 주요 개념 및 용어 정리
img: null
fig-caption: null
tags:
- redux
- 리덕스
- redux용어정리
- 리덕스용어정리
- redux란
---

# Redux란?

- action이라는 이벤트를 사용하여 애플리케이션 상태를 관리하고 업데이트 하기 위한 패턴 및 라이브러리
- 애플리케이션의 여러 부분에서 필요한 전역 상태를 관리함

## Redux 라이브러리 도구

### React-Redux

- Redux 저장소와 상호작용할 수 있도록 하는 공식 패키지

```bash
// npm
npm install react-redux

// yarm
yarn add react-redux
```

### Redux Toolkit

- Redux 로직 작성에 권장되는 접근 방식 (Redux 앱 빌드에 필요한 함수와 패키지가 포함 되어있음)

```bash
## create-react-app 명령어를 통한 생성시
npx create-react-app my-app --template redux

## 이미 존재하는 프로젝트에 추가할 경우
# NPM
npm install @reduxjs/toolkit

# Yarn
yarn add @reduxjs/toolkit
```

### Redux DevTools Extension

- Redux 개발 도구

[https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

[https://github.com/zalmoxisus/redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)

# Redux 용어 및 개념

## State Management (상태 관리)

- 아래와 같은 상황에서는 부모컴포넌트로 state를 올려서 해결할 수 있지만 Redux는 상태 관리와 관련된 개념을 정의 및 분리하고 뷰와 상태 간의 독립성을 유지하는 규칙을 시행함으로써 코드에 더 많은 구조와 유지 관리 기능을 제공한다.

```jsx
**function Counter() {
  // State(상태): a counter value
  const [counter, setCounter] = useState(0)

  // Action(액션): code that causes an update to the state when something happens
  const increment = () => {
    setCounter(prevCounter => prevCounter + 1)
  }

  // View(뷰): the UI definition
  return (
    <div>
      Value: {counter} <button onClick={increment}>Increment</button>
    </div>
  )
}**
```

## Immutability (불변성)

- Redux는 불변값을 변경하기 위해서 기존 객체를 복제하고 복제한 객체들을 수정하여 사용한다.

```jsx
const obj = {
  a: {
    // To safely update obj.a.c, we have to copy each piece
    c: 3
  },
  b: 2
}

const obj2 = {
  // copy obj
  ...obj,
  // overwrite a
  a: {
    // copy obj.a
    ...obj.a,
    // overwrite c
    c: 42
  }
}

const arr = ['a', 'b']
// Create a new copy of arr, with "c" appended to the end
const arr2 = arr.concat('c')

// or, we can make a copy of the original array:
const arr3 = arr.slice()
// and mutate the copy:
arr3.push('c')
```

## Action

- type 속성값을 가진 자바스크립트 객체
- type 필드는 작업을 설명하는 문자열이어야 함

```jsx
const addTodoAction = {
  type: 'todos/todoAdded',
  payload: 'Buy milk'
}
```

## Action Creators

- 액션 객체를 생성하고 반환하는 함수
- 일반적으로 사용하므로 매번 수동으로 액션 객체를 작성할 필요 없음

```jsx
const addTodo = text => {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}
```

## Reducers

- `state` 와 `action` 객체를 필요한 경우 상태를 업데이트 하는 방법을 결정하고, 새로운 상태를 반환함
- Reducer 규칙
    - `state` 와 `action` 인수를 기반으로 새 상태값만 계산해야 함
    - 기존의 `state` 를 수정할 수 없음. 기존 항목을 복사하고 복사된 값을 변경하여 업데이트 해야 함
    - 비동기 논리를 수행하거나 임의 값을 계산하거나 기타 부작용을 유발해서는 안됨

```jsx
const initialState = { value: 0 }

function counterReducer(state = initialState, action) {
  // Check to see if the reducer cares about this action
  if (action.type === 'counter/increment') {
    // If so, make a copy of `state`
    return {
      ...state,
      // and update the copy with the new value
      value: state.value + 1
    }
  }
  // otherwise return the existing state unchanged
  return state
}
```

## Store

- 리덕스의 상태값을 갖는 객체

```jsx
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({ reducer: counterReducer })

console.log(store.getState())
// {value: 0}
```

## Dispatch

- 상태를 업데이트하는 유일한 방법, 작업 객체를 호출하고 전달하는 것

```jsx
store.dispatch({ type: 'counter/increment' })

console.log(store.getState())
// {value: 1}
```

```jsx
const increment = () => {
  return {
    type: 'counter/increment'
  }
}

store.dispatch(increment())

console.log(store.getState())
// {value: 2}
```

## Selectors

- store 값에서 특정 정보를 부를 수 있는 함수 (반복되는 논리를 피할 수 있음)

```jsx
const selectCounterValue = state => state.value

const currentValue = selectCounterValue(store.getState())
console.log(currentValue)
// 2
```

## Middleware

- 리듀서가 액션을 처리하기 전에 실행되는 함수
