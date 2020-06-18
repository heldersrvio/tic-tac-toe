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

    const playOptions = document.createElement('div');
    playOptions.classList.add('play-options');

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

    playOptions.appendChild(playAgainstComputerButton);
    playOptions.appendChild(playAgainstHuman);

    const selectionScreen = function(){
        body.appendChild(playOptions);
    }

    const firstScreen = function(){
        let form = document.createElement('form');
        let labelP1 = document.createElement('label');
        let labelP2 = document.createElement('label');
        let inputP1 = document.createElement('input');
        let inputP2 = document.createElement('input');

        labelP1.for = "p1name";
        labelP1.textContent = "Player 1:";
        inputP1.type = "text";
        inputP1.id = "p1name";
        inputP1.name = "p1name";
        labelP2.for = "p2name";

        form.appendChild(labelP1);
        form.appendChild(inputP1);

        if (!againstComputer){

            labelP2.textContent = "Player 2:";
            inputP2.type = "text";
            inputP2.id = "p2name";
            inputP2.name = "p2name";

            form.appendChild(labelP2);
            form.appendChild(inputP2);
        }
        body.appendChild(form);

        body.appendChild(startButton);
    };

    const updateGameBoard = function(currentGame, container){
        if (container){
            for (let i = 0; i < 9; i++){
                let div = container.querySelector(`#\\3${i}`);
                if (div.firstChild.textContent != positions[i]){
                    div.firstChild.textContent = positions[i];
                    if (div.firstChild.textContent == 'O'){
                        div.firstChild.style.cssText = "color: rgb(255, 245, 106)"
                    }else{
                        div.firstChild.style.cssText = "color: rgb(106, 238, 255)"
                    }
                }
            }
            let res = currentGame.result();
            if (res && !document.querySelector('.result-message')){
                let resultMessage = document.createElement('div');
                resultMessage.classList.add('result-message');
                let resultMessageP = document.createElement('p');
                resultMessageP.textContent = res;
                resultMessage.appendChild(resultMessageP);
                body.insertBefore(resultMessage, restartButton);
            }
        }
    }

    const gameScreen = function(currentGame, container){
        if (start && container){
            for (let i = 0; i < 9; i++){
                let div = document.createElement('div');
                let p = document.createElement('p');
                p.textContent = positions[i];
                if (p.textContent == 'O'){
                    p.style.cssText = "color: rgb(255, 245, 106)"
                }else{
                    p.style.cssText = "color: rgb(106, 238, 255)"
                }
                div.appendChild(p);
                div.id = i.toString();
                div.addEventListener('click', e => {
                    lastClicked = i;
                    currentGame.play();
                    if (againstComputer){
                        currentGame.play();
                    }
                    updateGameBoard(currentGame, container);
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
        let options = document.querySelector('.play-options');
        if (options){
            body.removeChild(options);
        }
        let button = document.querySelector('button');
        while (button){
            body.removeChild(button);
            button = document.querySelector('button');
        }
        let message = document.querySelector('.result-message');
        if (message){
            body.removeChild(message);
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

    const block = function(currentPositions = gameboard.getPositions()){
        for (let i = 0; i < 9; i++){
            if (currentPositions[i] == ""){
                let newPositions = currentPositions.slice(0);
                newPositions[i] = "X";
                if (winner(newPositions) == player1){
                    return i;
                }
            }
        }
        return null;
    };

    const doubleWin = function(currentPositions = gameboard.getPositions()){
        let opponentWinPossibilities = 0
        for (let i = 0; i < 9; i++){
            if (currentPositions[i] == ""){
                let newPositions = currentPositions.slice(0);
                newPositions[i] = "X";
                for (let j = 0; j < 9; j++){
                    if (newPositions[j] == ""){
                        let newNewPositions = newPositions.slice(0);
                        newNewPositions[j] = "X";
                        if (winner(newNewPositions) == player1){
                            opponentWinPossibilities++;
                        }
                    } 
                }
                if (opponentWinPossibilities > 1){
                    return i;
                }
                opponentWinPossibilities = 0;
            }
        }
        return null;
    }

    const diagonalPattern = function(currentPositions = gameboard.getPositions()){
        if (currentPositions[4] == "O"){
            if (currentPositions[0] == currentPositions[8] && currentPositions[0] == 'X' || currentPositions[2] == currentPositions[6] && currentPositions[2] == 'X'){
                let diagonalPositions = [currentPositions[1], currentPositions[3], currentPositions[5], currentPositions[7]].filter(v => v == "").map((v, i) => i);
                if (diagonalPositions.length > 0){
                    return diagonalPositions[Math.floor(Math.random() * diagonalPositions.length)];
                }
            }
        }
        return null;
    };

    const winningPattern = function(currentPositions = gameboard.getPositions()){
        for (let i = 0; i < 9; i++){
            if (currentPositions[i] == ""){
                let newPositions = currentPositions.slice(0);
                newPositions[i] = "O";
                if (winner(newPositions) && winner(newPositions) == player2){
                    return i;
                }
            }
        }
        return null;
    };
    
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

    const sameColumHasX = function(currentPositions = gameboard.getPositions(), a){
        switch(a){
            case 0:
            case 3:
            case 6:
                return ([currentPositions[0], currentPositions[3], currentPositions[6]].includes("X"));
            case 1:
            case 4:
            case 7:
                return ([currentPositions[1], currentPositions[4], currentPositions[7]].includes("X"));
            case 2:
            case 5:
            case 8:
                return ([currentPositions[2], currentPositions[5], currentPositions[8]].includes("X"));
            default:
                return false;
        }
    }

    const sameRowHasX = function(currentPositions = gameboard.getPositions(), a){
        switch(a){
            case 0:
            case 1:
            case 2:
                return ([currentPositions[0], currentPositions[1], currentPositions[2]].includes("X"));
            case 3:
            case 4:
            case 5:
                return ([currentPositions[3], currentPositions[4], currentPositions[5]].includes("X"));
            case 6:
            case 7:
            case 8:
                return ([currentPositions[6], currentPositions[7], currentPositions[8]].includes("X"));
            default:
                return false;
        }
    }

    const decision = function(currentPositions = gameboard.getPositions()){
        let currentIndex = 0;
        let currentValue = null;
        let blockPossibility = block(currentPositions);
        let diagonalPatternPossibility = diagonalPattern(currentPositions);
        let winningPatternPossibility = winningPattern(currentPositions);
        let doubleWinPossibility = doubleWin(currentPositions);
        if (currentPositions.filter(v => v == "X").length == 1){
            if ([0, 2, 6, 8].includes(currentPositions.indexOf('X'))){
                return 4;
            }
            if (currentPositions.indexOf('X') == 4){
                return [0, 2, 6, 8][Math.floor(Math.random() * 4)];
            }
        }
        if (winningPatternPossibility != null){
            return winningPatternPossibility;
        }
        if (blockPossibility != null){
            return blockPossibility;
        }
        if (diagonalPatternPossibility != null){
            return diagonalPatternPossibility;
        }
        if (doubleWinPossibility != null){
            return doubleWinPossibility;
        }
        for (let i = 0; i < 9; i++){
            if (currentPositions[i] == ""){
                let newPositions = currentPositions.slice(0);
                newPositions[i] = "O";
                let mm = miniMax(newPositions, "X");
                if ((currentValue == null || mm > currentValue) && (sameColumHasX(currentPositions, i) || sameRowHasX(currentPositions, i))){
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
            return "It's a tie.";
        }else if (winner(currentPositions) && winner(currentPositions).getSymbol() == player1.getSymbol()){
            return player1.getName() + " won the game.";
        }else if (winner(currentPositions)){
            return player2.getName() + " won the game.";
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
        }
    };

    return {
        result,
        play,
    };

});

gameboard.render();