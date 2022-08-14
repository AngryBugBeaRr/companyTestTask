import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'

function Square(props) {
    return (
        /*id выбран таким, потому что другие заняты и чтобы они не перекликались и все работало
        * было принято решение сделать таким образом*/
        <button id={(props.id + 1) * 10} className="square" onClick={props.onClick} >
            {props.value}
        </button>
    )
}

class Board extends React.Component {

    renderSquare(i) {
        return <Square
            key={i}
            id={i}
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
        />;
    }

    render() {
        const rows = this.props.squaresCount;
        const cells = this.props.squaresCount;
        return (
            <div>
                {[...Array(rows).keys()].map(row => (
                    <div className="board-row" key={row}>
                        {[...Array(cells).keys()].map(cell => this.renderSquare(row * cells + cell))}
                    </div>
                ))}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squaresCount: 3,
            squares: Array(9).fill(null),
            stepNumber: 0,
            status: false,
            difficult: 'Easy',
        }
    }

    /*Функция для случайного выставления маркера*/

    randomMarker() {
        const squares = this.state.squares;
        let rows = this.state.squaresCount;
        /*С помощью Math.random мы получаем случайное число от 0 до 1, умножаем на 1000 для получения
        * случайного числа от 0 до 1000, после чего мы берем модуль этого числа по количеству наших клеток*/
        let randomSquare = Math.round(Math.random() * 1000 % (rows * rows - 1));
        squares[randomSquare] = 'I';
        return randomSquare;
    }

    /*Функция проверки правильности ответа*/

    checkAnswer(start, moves, select) {
        let finish = start;
        let row = this.state.squaresCount;
        for (let i = 0; i < moves.length; i++) {
            /*Здесь с помощью switch мы просчитываем правильный ответ для дальнейшей проверки*/
            switch (moves[i]) {
                case 'Вверх':
                    if (finish - row >= 0)
                        finish -= row;
                    break;
                case 'Вниз':
                    if (finish + row < row * row)
                        finish += row;
                    break;
                case 'Влево':
                    if ((finish % row) - 1 >= 0)
                        finish -= 1;
                    break;
                case 'Вправо':
                    if ((finish % row) + 1 <= row && finish + 1 <= row * row)
                        finish += 1;
                    break;
            }
        }
        /*Если наш ответ неверен, то нужно указать наш ответ и правильный*/
        if (finish !== select) {
            document.getElementById((select + 1) * 10).classList.add('activeLose');
        }
        /*Если ответ верный, то просто указываем верный ответ*/
        document.getElementById((finish + 1) * 10).classList.add('activeWin');
        return finish;
    }

    /*Функция получения случайных ходов, в зависимости от сложности их может быть 10, 15 и 25*/

    getRandomMoves() {
        let difficult = this.state.difficult;
        let countMoves;
        let moves = ['Вверх', 'Вниз', 'Влево', 'Вправо'];
        let randomMoves = [];
        /*С помощью switch понимаем нашу сложность и поэтому выбираем количество нужных ходов*/
        switch (difficult) {
            case 'Easy':
                countMoves = 10;
                break;
            case 'Normal':
                countMoves = 15;
                break;
            case 'Hard':
                countMoves = 25;
                break;
        }
        for (let i = 0; i < countMoves; i++) {
            /*Здесь такая же схема, как и в выборе маркера*/
            randomMoves[i] = moves[Math.round(Math.random() * 1000 % 3)];
        }
        return randomMoves;
    }

    /*Функция для масштабируемости поля*/

    changeSquaresCount(action) {
        let now = this.state.squaresCount;
        let newSquares = Array(now + 1).fill(null);
        /*Здесь нам нужно понять что мы будем делать, увеличивать или уменьшать поля, сделано ограничение поля
        * от 3 до 10 ячеек.
        * Потом очищаем все имеющиеся ячейки и приравниваем им NULL, чтобы не было ситуации, когда появляется несколько
        * маркеров, после чего в state увеличиваем количество ячеек на одну или уменьшаем*/
        if (action === 'Increase') {
            if (now < 10) {
                this.setState({
                    squaresCount: now + 1,
                    squares: newSquares,
                })
            }
        } else {
            if (now > 3) {
                this.setState({
                    squaresCount: now - 1,
                    squares: newSquares,
                })
            }
        }
    }

    /*Функция перезапуска игры*/

    restartGame() {
        let now = this.state.squaresCount;
        let newSquares = Array(now).fill(null);
        /*Создаем новые ячейки и передаем их в state, добавляем маркер и обновляем ходы
        и в конце сбрасываем прошлый ответ */
        this.setState({
            squares: newSquares,
        })
        this.randomMarker();
        this.getRandomMoves();
        for (let i = 0; i < now * now; i++){
            document.getElementById((i + 1) * 10).classList.remove('activeWin');
            document.getElementById((i + 1) * 10).classList.remove('activeLose');
        }
    }

    /*Функция изменения сложности*/

    changeDifficult() {
        /*Делаем рестарт, проверяем сложность игры на данный момент, потом в зависимости от нынешней сложности
        * меняем количество начальных ячеек и увеличиваем количество ходов*/
        this.restartGame();
        let now = this.state.difficult;
        let rows;
        let newDifficult = '';
        switch (now) {
            case 'Normal':
                newDifficult = 'Hard';
                rows = 10;
                break;
            case 'Hard':
                newDifficult = 'Easy';
                rows = 3;
                break;
            case 'Easy':
                newDifficult = 'Normal';
                rows = 6;
                break;
        }
        this.setState({
            difficult: newDifficult,
            squaresCount: rows,
        })
    }

    render() {
        let randomSquare = this.randomMarker();
        let status = this.state.status ? 'Вы выиграли' : 'Игра';
        let difficult = this.state.difficult;
        let mv = this.getRandomMoves();
        let moves = mv.map((step, move) => {
            return (
                <li key={move}>
                    <span className="moves">
                        {step}
                    </span>
                </li>
            );
        });
        return (
            <div className="game">
                <div className="game-buttons">
                    <button className="btn" onClick={() => this.changeSquaresCount('Decrease')}>
                        Decrease
                    </button>
                    <button className="btn" onClick={() => this.changeSquaresCount('Increase')}>
                        Increase
                    </button>
                    <button className="btn" onClick={() => this.restartGame()}>
                        Restart
                    </button>
                    <button className="btn" onClick={() => this.changeDifficult()}>
                        Change Difficult
                    </button>
                </div>
                <div className="game-board">
                    <Board
                        squares={this.state.squares}
                        squaresCount={this.state.squaresCount}
                        onClick={(i) => {this.checkAnswer(randomSquare, mv, i)}}
                    />
                </div>
                <div className="game-info">
                    <div>
                        {status}
                        <span className="difficult">{difficult}</span>
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

