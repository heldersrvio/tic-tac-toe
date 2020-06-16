const player = (function(pname, xOrO){
    const symbol = xOrO;
    const name = pname;
    const getSymbol = () => symbol;
    const getName = () => name;
    return{
        getSymbol,
        getName,
    }
});

const gameboard = (function(document){
    let body = document.querySelector('body');
    let positions = ["", "", "", "", "", "", "", "", ""];
    let lastClicked = null;
    let start = false;
    let player1Name = "";
    let player2Name = "";
    let againstComputer = false;

    const startButton = document.createElement('button');
    startButton.textContent = "Start";
    startButton.addEventListener('click', e => {
        let container = document.querySelector('.gameboard');
        let p1name = document.querySelector('#p1name').value;
        let p2name = document.querySelector('#p2name') ? document.querySelector('#p2name').value : "Computer";

        p1name ? player1Name = p1name : player1Name = "Player 1";
        p2name ? player2Name = p2name : player2Name = "Player 2";

        start = true;
        clear();
        let currentGame = game(getPlayer1(), getPlayer2());
        gameScreen(currentGame, container);
    });

    const restartButton = document.createElement('button');
    restartButton.textContent = "Restart";
    restartButton.addEventListener('click', e => {
        positions = ["", "", "", "", "", "", "", "", ""];
        start = false;
        lastClicked = null;
        player1Name = "";
        player2Name = "";
        clear();
        selectionScreen();
    });

    const playAgainstComputerButton = document.createElement('button');
    playAgainstComputerButton.textContent = "Play against the computer";
    playAgainstComputerButton.addEventListener('click', e => {
        againstComputer = true;
        clear();
        firstScreen();
    });

    const playAgainstHuman = document.createElement('button');
    playAgainstHuman.textContent = "Play against someone else";
    playAgainstHuman.addEventListener('click', e => {
        againstComputer = false;
        clear();
        firstScreen();
    });

    const selectionScreen = function(){
        body.appendChild(playAgainstComputerButton);
        body.appendChild(playAgainstHuman);
    }

    const firstScreen = function(){
        let form = document.createElement('form');
        let labelP1 = document.createElement('label');
        let labelP2 = document.createElement('label');
        let inputP1 = document.createElement('input');
        let inputP2 = document.createElement('input');

        labelP1.for = "p1name";
        labelP1.textContent = "Player 1";
        inputP1.type = "text";
        inputP1.id = "p1name";
        inputP1.name = "p1name";
        labelP2.for = "p2name";

        form.appendChild(labelP1);
        form.appendChild(inputP1);

        if (!againstComputer){

            labelP2.textContent = "Player 2";
            inputP2.type = "text";
            inputP2.id = "p2name";
            inputP2.name = "p2name";

            form.appendChild(labelP2);
            form.appendChild(inputP2);
        }
        body.appendChild(form);

        body.appendChild(startButton);
    };

    const updateGameBoard = function(container){
        if (container){
            for (let i = 0; i < 9; i++){
                let div = container.querySelector(`#\\3${i}`);
                if (div.firstChild.textContent != positions[i]){
                    div.firstChild.textContent = positions[i];
                }
            }
        }
    }

    const gameScreen = function(currentGame, container){
        if (start && container){
            for (let i = 0; i < 9; i++){
                let div = document.createElement('div');
                let p = document.createElement('p');
                p.textContent = positions[i];
                div.appendChild(p);
                div.id = i.toString();
                div.style.cssText = "border: 1pt solid black";
                div.addEventListener('click', e => {
                    lastClicked = i;
                    currentGame.play();
                    updateGameBoard(container);
                });
                container.appendChild(div);
            }
            body.appendChild(restartButton);
        }
    };

    const getPositions = () => positions;

    const setPosition = function(i, symbol){
        if (i < 9 && positions[i] == ""){
            positions[i] = symbol;
            return i;
        }
        return null;
    };

    const clear = function(){
        const container = document.querySelector('.gameboard');
        if (container){
            while (container.firstChild){
                container.removeChild(container.lastChild);
            }
        }
        let form = document.querySelector('form');
        if (form){
            body.removeChild(form);
        }
        let button = document.querySelector('button');
        while (button){
            body.removeChild(button);
            button = document.querySelector('button');
        }
    };

    const render = function(){
        clear();
        if (!start){
            selectionScreen();
        }
        let container = document.querySelector('.gameboard');
        if (container){
            gameScreen(container);
        }
    };

    const getLastClicked = () => lastClicked;

    const getPlayer1 = () => player(player1Name, "X");
    const getPlayer2 = () => player(player2Name, "O");

    return {
        getPositions,
        setPosition,
        gameScreen,
        render,
        getLastClicked,
        getPlayer1,
        getPlayer2,
    };

})(document);

const game = (function(player1, player2){
    
    let currentPlayer = player1;
    const winningSequences = ["012", "345", "678", "036", "147", "258", "048", "246"];

    const miniMax = function(currentPositions = gameboard.getPositions(), symbol = "O"){
        let currentResult = result(currentPositions);
        switch(currentResult){
            case player1.getName():
                return -1;
            case player2.getName():
                return 1;
            case "TIE":
                return 0;
            default:
                break;
        }
        let score = 0;
        for (let i = 0; i < 9; i++){
            if (currentPositions[i] == ""){
                let newPositions = currentPositions.slice(0);
                newPositions[i] = symbol;
                let newSymbol = (symbol == "O") ? "X" : "O";
                score += miniMax(newPositions, newSymbol);
            }
        }
        return score;
    };

    const decision = function(currentPositions = gameboard.getPositions()){
        let currentIndex = 0;
        let currentValue = null;
        for (let i = 0; i < 9; i++){
            if (currentPositions[i] == ""){
                let newPositions = currentPositions.slice(0);
                newPositions[i] = "O";
                if (winner(newPositions) && winner(newPositions) == player2){
                    return i;
                }
                let mm = miniMax(newPositions, "X");
                console.log(mm);
                if (currentValue == null || mm > currentValue){
                    currentValue = mm;
                    currentIndex = i;
                }
            }
        }
        return currentIndex;
    };

    const winner = function(currentPositions = gameboard.getPositions()){
        for (let i = 0; i < winningSequences.length; i++){
            let char0 = currentPositions[+winningSequences[i].charAt(0)];
            let char1 = currentPositions[+winningSequences[i].charAt(1)];
            let char2 = currentPositions[+winningSequences[i].charAt(2)];
            if (char0 != "" && char0 == char1 && char1 == char2){
                return (player1.getSymbol() == char0) ? player1 : player2;
            }
        }
        return null;
    };

    const isTied = function(currentPositions = gameboard.getPositions()){
        return ((currentPositions.filter((s) => s == "")).length == 0 && !winner(currentPositions));
    };
    const result = function(currentPositions = gameboard.getPositions()){
        if (isTied(currentPositions)){
            return "TIE";
        }else if (winner(currentPositions) && winner(currentPositions).getSymbol() == player1.getSymbol()){
            return player1.getName();
        }else if (winner(currentPositions)){
            return player2.getName();
        }else{
            return null;
        }
    };

    const play = function(){
        let currentResult = result();
        if (!currentResult){
            if (currentPlayer.getName() == "Computer"){
                gameboard.setPosition(decision(), currentPlayer.getSymbol());
                currentPlayer = (currentPlayer == player1) ? player2 : player1;
            }
            else if (gameboard.setPosition(gameboard.getLastClicked(), currentPlayer.getSymbol()) !== null){
                currentPlayer = (currentPlayer == player1) ? player2 : player1;
            }
        }else{
            console.log(currentResult);
        }
    };

    return {
        result,
        play,
    };

});

gameboard.render();