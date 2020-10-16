---
title: 리액트(React) Tic Tac Toe 게임 만들기
layout: post
date: '2020-10-16 17:31:00 +0300'
description: 리액트(React) Tic Tac Toe 게임 만들기
img: null
fig-caption: null
tags:
- react
- 리액트
- reacttutorial
- 리액트튜토리얼
- reacttictactoe
---

React  공식 문서에 있는 Tic Tac Toe 게임을 따라하면서 정리 해보았다.

[https://ko.reactjs.org/tutorial/tutorial.html#prerequisites](https://ko.reactjs.org/tutorial/tutorial.html#prerequisites)

# Props로 데이터 전달

```jsx
class Board extends React.Component {
  renderSquare(i) {
    //Square 컴포넌트에 value라는 키값으로 i값을 pros로 전달
    return <Square value={i} />;
  }
}

class Square extends React.Component {
  render() {
    return (
      <button className="square">
				//Board 컴포넌트에서 받아온 value 값을 출력
        {this.props.value}
      </button>
    );
  }
}
```

# 버튼을 클릭할 시 X 표시가 되도록 하기

`onClick={alert('click')}` 로 작성하는 실수를 많이 한다고 함.

`onClick={() => alert('click')}` 로 작성하도록 함.

화살표 함수를 쓰는 이유 : 타이핑 횟수를 줄이고 this의 혼란스러운 동작을 피하기 위함.

```jsx
class Square extends React.Component {
  render() {
    return (
			//버튼을 클릭했을 때 alert이 뜨도록 처리
      <button className="square" onClick={function() { alert('click'); }}>
        {this.props.value}
      </button>
    );
  }
}

class Square extends React.Component {
 render() {
   return (
			//화살표 함수를 사용해서 간단하게 표현할 수도 있음
     <button className="square" onClick={() => alert('click')}>
       {this.props.value}
     </button>
   );
 }
}
```

# 생성자 추가

- JavaScript 클래스에서 하위 클래스의 생성자를 정의할 때 항상 super를 호출해야 함
- 모든 React 컴포넌트 클래스는 생성자를 가질 때 super(props) 호출 구문부터 작성해야 함

```jsx
class Square extends React.Component {
  //생성자를 추가하여 value라는 state 값을 초기화
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  render() {
    return (
      <button className="square" onClick={() => alert('click')}>
        {this.props.value}
      </button>
    );
  }
}
```

```jsx
class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  render() {
    return (
      <button
        className="square"
				//버튼 클릭시 value라는 state 변수에 'X'값을 세팅
        onClick={() => this.setState({value: 'X'})}
      >
        {this.state.value}
      </button>
    );
  }
}
```

# State 끌어 올리기

- 각 Square 컴포넌트가 아닌 부모 Board 컴포넌트에 게임의 상태를 저장하는 것이 가장 좋은 방법
- 각 Square에 숫자를 넘겨주었을 때와 같이 Board 컴포넌트는 각 Square에게 prop을 전달하는 것으로 무엇을 표시할 지 알려줌
- 자식으로부터 데이터를 모으거나 두 개의 자식 컴포넌트들이 서로 통신하게 하려면 부모 컴포넌트에 공유 state를 정의해야 함
- 부모 컴포넌트는 props를 사용하여 자식 컴포넌트에 state를 다시 전달할 수 있음

```jsx
class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
			//9개의 사각형에 해당하는 9개의 null 배열을 초기화 하고 state로 설정
      squares: Array(9).fill(null),
    };
  }

// ==> state로 변경
	renderSquare(i) {
    return <Square value={this.state.squares[i]} />;
  }
```

- Board에서 Square로 함수를 전달하고 사각형을 클릭할 때 함수 호출

```jsx
//Board 컴포넌트 중간
renderSquare(i) {
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
      />
    );
  }

handleClick(i) {
  const squares = this.state.squares.slice();
  squares[i] = 'X';
  this.setState({squares: squares});
}

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
				//Board에서 받아온 props에 들어있는 함수 세팅
        onClick={() => this.props.onClick()}
      >
				//Board에서 받아온 props에 들어있는 value 값 세팅
        {this.props.value}
      </button>
    );
  }
}
```

# 불변성

- 복잡한 특징들을 단순하게 만듦, 변화를 감지함, 다시 렌더링하는 시기를 결정함
- 데이터 변경 방법

    1.데이터를 직접 변경

    ```jsx
    var player = {score: 1, name: 'Jeff'};
    player.score = 2;
    ```

    2.새로운 사본 데이터로 교체

    ```jsx
    var player = {score: 1, name: 'Jeff'};

    var newPlayer = Object.assign({}, player, {score: 2});
    ```

# 함수 컴포넌트

- 더 간단하게 컴포넌트를 작성하는 방법
- state 없이 render 함수만을 가짐
- this가 사라짐

```jsx
//클래스형 컴포넌트
class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
				//Board에서 받아온 props에 들어있는 함수 세팅
        onClick={() => this.props.onClick()}
      >
				//Board에서 받아온 props에 들어있는 value 값 세팅
        {this.props.value}
      </button>
    );
  }
}

//함수형 컴포넌트
function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}
```

# 순서 만들기

```jsx
class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null),
			//첫번째 차례의 기본값 세팅
      xIsNext: true,
    };
  }

	handleClick(i) {
	  const squares = this.state.squares.slice();
    //삼항 연산자 활용 세팅
	  squares[i] = this.state.xIsNext ? 'X' : 'O';
	  this.setState({
	    squares: squares,
      //xIsNext state 값에 따라 true, false 값 변경
	    xIsNext: !this.state.xIsNext,
	  });
	}

	render() {
			//status을 통해 다음 차례 플레이어를 알려줌
	    const status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
	
	    return (
	      // 나머지는 그대로
```

- 순서 만들기 완성 소스

```jsx
class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null),
      xIsNext: true,
    };
  }

  handleClick(i) {
    const squares = this.state.squares.slice();
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
    });
  }

  renderSquare(i) {
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  render() {
    const status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}
```

# 승자 결정하기

- 최하단에 해당 소스 추가

```jsx
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
```

- Board render 함수에 추가 (누가 우승했는지 문구 표시용)

```jsx
render() {
    const winner = calculateWinner(this.state.squares);
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

...
```

```jsx
handleClick(i) {
  const squares = this.state.squares.slice();
  //누군가 승리하거나 Square가 이미 채워져있다면 handleClick 함수가 무시하도록 처리
  if (calculateWinner(squares) || squares[i]) {
    return;
  }
  squares[i] = this.state.xIsNext ? 'X' : 'O';
  this.setState({
    squares: squares,
    xIsNext: !this.state.xIsNext,
  });
}
```

# 시간 여행 추가하기

## 동작에 대한 기록 저장하기

- 과거의 squares 배열들을 history라는 다른 배열에 저장

## 다시 state 끌어올리기

```jsx
class Game extends React.Component {
  //초기 state 설정
  constructor(props) {
    super(props);
    this.state = {
      //history라는 저장된 과거의 차례를 Board가 렌더링할 수 있게 만들 예정
      history: [{
        squares: Array(9).fill(null),
      }],
      xIsNext: true,
    };
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}
```

```jsx
class Board extends React.Component {
  handleClick(i) {
    const squares = this.state.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
    });
  }

  renderSquare(i) {
    return (
      <Square
        //Game 컴포넌트에서 전달받은 value값과 onClick 함수를 전달함
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const winner = calculateWinner(this.state.squares);
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}
```

- 함수를 가장 최근 기록을 사용하도록 업데이트하여 게임의 상태를 확인하고 표시

```jsx
//Game 컴포넌트, Board render 함수에서 중복되는 코드는 제거 필요
render() {
  const history = this.state.history;
  const current = history[history.length - 1];
  const winner = calculateWinner(current.squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.squares}
          onClick={(i) => this.handleClick(i)}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <ol>{/* TODO */}</ol>
      </div>
    </div>
  );
}
```

```jsx
//Board render 함수에서 중복 제거 후
render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
```

- handleClick 함수를 Board에서 Game 컴포넌트로 이동

```jsx
//state가 다르기 때문에 handleClick 수정 필요
handleClick(i) {
  const history = this.state.history;
  const current = history[history.length - 1];
  const squares = current.squares.slice();
  if (calculateWinner(squares) || squares[i]) {
    return;
  }
  squares[i] = this.state.xIsNext ? 'X' : 'O';
  this.setState({
    history: history.concat([{
      squares: squares,
    }]),
    xIsNext: !this.state.xIsNext,
  });
}
```

## 과거의 이동 표시하기

- 다른 데이터와 함께 매핑할 때 사용하는 `map()` 함수 활용

```jsx
//Game 컴포넌트
render() {
  const history = this.state.history;
  const current = history[history.length - 1];
  const winner = calculateWinner(current.squares);

  //돌아가는 버튼 목록 표시
  const moves = history.map((step, move) => {
    const desc = move ?
      'Go to move #' + move :
      'Go to game start';
    return (
      <li>
        <button onClick={() => this.jumpTo(move)}>{desc}</button>
      </li>
    );
  });
  //

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.squares}
          onClick={(i) => this.handleClick(i)}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        //돌아가는 버튼 목록 표시
        <ol>{moves}</ol>
      </div>
    </div>
  );
}
```

## 시간 여행 구현하기

```jsx
//Game 컴포넌트 render 함수안
const moves = history.map((step, move) => {
    const desc = move ?
      'Go to move #' + move :
      'Go to game start';
    return (
      //key 값 구현, React의 key에 대한 경고가 사라짐
      <li key={move}>
        <button onClick={() => this.jumpTo(move)}>{desc}</button>
      </li>
    );
  });
```

```jsx
//Game 컴포넌트 state 추가
class Game extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
	    history: [{
	      squares: Array(9).fill(null),
	    }],
      //초기값 세팅
	    stepNumber: 0,
	    xIsNext: true,
	  };
	}
```

```jsx
//Game 컴포넌트에 jumpTo 함수 추가
handleClick(i) {
  // 이 함수는 변하지 않음
}

//짝수일 때마다 xIsNext true
jumpTo(step) {
  this.setState({
    stepNumber: step,
    xIsNext: (step % 2) === 0,
  });
}

render() {
  // 이 함수는 변하지 않음
}
```

```jsx
//Game 컴포넌트
handleClick(i) {
  //새로운 이동이 발생할 때 미래의 기록을 모두 날려버림
	const history = this.state.history.slice(0, this.state.stepNumber + 1);
  const current = history[history.length - 1];
  const squares = current.squares.slice();
  if (calculateWinner(squares) || squares[i]) {
    return;
  }
  squares[i] = this.state.xIsNext ? 'X' : 'O';
  this.setState({
    history: history.concat([{
      squares: squares
    }]),
    //history의 갯수만큼 세팅
    stepNumber: history.length,
    xIsNext: !this.state.xIsNext,
  });
}
```

```jsx
//Game 컴포넌트
render() {
    const history = this.state.history;
    //state 값으로 세팅한 stepNumber로 현재 선택된 이동으로 렌더링
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
```

# 최종 소스

```jsx
function Square(props){
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
          
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }
  
  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }
  
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length -1];
    const squares = current.squares.slice();
    if(calculateWinner(squares) || squares[i]){
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,  
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    
    const moves = history.map((step, move) => {
      const desc = move ? 
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={()=>this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    
    let status;
    if(winner){
      status = 'Winner:' + winner;
    }else{
      status = 'Next player: ' + (this.state.xIsNext?  'X': 'O');
    }
    
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
```
