const NCOLS = 10, NROWS = 10;

const gameBoard = document.querySelector('.game-board');
// add the to game board
// grid-template-columns: repeat(10, 1fr);
// grid-template-rows: repeat(10, 1fr);
gameBoard.style.gridTemplateColumns = `repeat(${NCOLS}, 1fr)`;
gameBoard.style.gridTemplateRows = `repeat(${NROWS}, 1fr)`;

// add 100 game cells to the game board
let values = [], rewards = [] , obstacle = [];
for (let i = 0; i < NROWS ; i++) {
    row = [];
    for (let j = 0; j < NCOLS ; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell-2');
        cell.classList.add('game-cell');
        // give cell id "cell-i-j"
        cell.id = `cell-${i}-${j}`;
        cell.innerHTML = 0;
        // add event listener to each cell
        cell.addEventListener('click', handleClick);
        gameBoard.appendChild(cell);
        row.push(0);
    }
    values.push(row.slice());
    rewards.push(row.slice());
    obstacle.push(row.slice());
}
let GAME_STATE='PICKING_REWARD' ;
let startRow, startCol;
function handleClick(e) {
    const cell = e.target;
    const id = cell.id;
    const [row, col] = id.split('-').slice(1);
    if(GAME_STATE==='PICKING_REWARD'){
        rewards[row][col] = 1;
        // make cell green
        cell.classList.remove('cell-2');
        cell.classList.add('cell-reward');
        GAME_STATE='PICKING_DEATH'
        document.querySelector('.instruction').innerHTML = 'Choose death cell';
    }
    else if(GAME_STATE==='PICKING_DEATH'){
        rewards[row][col] = -1;
        // make cell red
        cell.classList.remove('cell-2');
        cell.classList.add('cell-death');
        GAME_STATE='PICKING_START'
        document.querySelector('.instruction').innerHTML = 'Choose start cell';
    }
    else if(GAME_STATE==='PICKING_START'){
        startRow = row;
        startCol = col;
        GAME_STATE='PICKING_OBSTACLES'
        // make cell blue
        cell.classList.remove('cell-2');
        cell.classList.add('cell-current');
        document.querySelector('.instruction').innerHTML = 'Select obstacles. When done click start';
        // add event listener to start-button
        document.querySelector('#start-button').addEventListener('click', startGame);
    }
    else if(GAME_STATE==='PICKING_OBSTACLES'){
        obstacle[row][col] = 1;
        // make cell black
        cell.classList.remove('cell-2');
        cell.classList.add('cell-1');
    }
}
function startGame(){
    // remove event listener from start-button
    document.querySelector('#start-button').removeEventListener('click', startGame);
    // remove event listener from game cells
    const gameCells = document.querySelectorAll('.game-cell');
    gameCells.forEach(cell => {
        cell.removeEventListener('click', handleClick);
    });
    // change instruction
    document.querySelector('.instruction').innerHTML = 'Game started';
    // start game
    simulate();
}
console.log(obstacle);
const gamma = 0.8;
async function simulate(){
    console.log("Simulation began");
    while(true){
        let prevValues = values.slice();
        for(let i=0; i<NROWS; i++){
            for(let j=0; j<NCOLS; j++){
                if(obstacle[i][j] || rewards[i][j]){
                    continue;
                }
                x = parseInt(i);
                y = parseInt(j);
                console.log("currently at ", x, y);
                let currValue = -9999999;
                // let possibleMoves = [];
                // treat everything as float
                if(x && !obstacle[x-1][y]){
                    currValue = Math.max(currValue, parseFloat(rewards[x-1][y]) + gamma * parseFloat(prevValues[x-1][y]));
                    // possibleMoves.push([x-1, y]);
                    // console.log("currValue = ", currValue);
                }
                if(x<NROWS-1 && obstacle[x+1] && !obstacle[x+1][y]){
                    // currValue = Math.max(currValue, rewards[x+1][y] + gamma * prevValues[x+1][y]);
                    currValue = Math.max(currValue, parseFloat(rewards[x+1][y]) + gamma * parseFloat(prevValues[x+1][y]));
                    // possibleMoves.push([x+1, y]);
                    // console.log("currValue = ", currValue);
                }
                if(y && !obstacle[x][y-1]){
                    // currValue = Math.max(currValue, rewards[x][y-1] + gamma * prevValues[x][y-1]);
                    currValue = Math.max(currValue, parseFloat(rewards[x][y-1]) + gamma * parseFloat(prevValues[x][y-1]));
                    // possibleMoves.push([x, y-1]);
                    // console.log("currValue = ", currValue);
                }
                if(y<NCOLS-1 && !obstacle[x][y+1]){
                    // currValue = Math.max(currValue, rewards[x][y+1] + gamma * prevValues[x][y+1]);
                    currValue = Math.max(currValue, parseFloat(rewards[x][y+1]) + gamma * parseFloat(prevValues[x][y+1]));
                    // possibleMoves.push([x, y+1]);
                    // console.log("currValue = ", currValue);
                }
                values[x][y] = parseFloat(currValue);
                console.log(currValue) ;
                // update cell value
                document.querySelector(`#cell-${x}-${y}`).innerHTML = currValue.toFixed(2);
                document.querySelector(`#cell-${x}-${y}`).style.fontSize = '14px';
                // depedning upon the value of the cell, change the color of the cell to warm / moderatly warm / cold / moderatly cold / neutral
                if(currValue > 0.5){
                    document.querySelector(`#cell-${x}-${y}`).classList.remove('cell-2');
                    document.querySelector(`#cell-${x}-${y}`).classList.add('cell-warm');
                }
                else if(currValue > 0.2){
                    document.querySelector(`#cell-${x}-${y}`).classList.remove('cell-2');
                    document.querySelector(`#cell-${x}-${y}`).classList.add('cell-moderately-warm');
                }
                else if(currValue < -0.2){
                    document.querySelector(`#cell-${x}-${y}`).classList.remove('cell-2');
                    document.querySelector(`#cell-${x}-${y}`).classList.add('cell-cold');
                }
                else if(currValue < -0.5){
                    document.querySelector(`#cell-${x}-${y}`).classList.remove('cell-2');
                    document.querySelector(`#cell-${x}-${y}`).classList.add('cell-moderately-cold');
                }
                else{
                    document.querySelector(`#cell-${x}-${y}`).classList.add('cell-2');
                }
                // randomly go to next cell
                // let nextMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                // x = nextMove[0];
                // y = nextMove[1];
            }
        }
        console.log(values);
        // sleep for 1 second
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}