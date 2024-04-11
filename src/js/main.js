let board = null;
let game = new Xiangqi();

const nuocCo = document.getElementById("nuoc-co");
const hetTran = document.getElementById("het-tran");

const config = {
    boardTheme: "../docs/img/xiangqiboards/test.png",
    pieceTheme: "../docs/img/xiangqipieces/wikimedia/{piece}.svg",
    orientation: "white",
    position: "start",
    showNotation: true,
    draggable: true,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd,
};

config.pieceTheme = "../docs/img/xiangqipieces/graphic/{piece}.svg";
board = Xiangqiboard("#myBoard", config);

function makeRandomMove() {
    let possibleMoves = game.moves();

    // game over
    if (possibleMoves.length === 0) return;

    let randomIdx = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIdx]);
    board.position(game.fen());
    updateStatus();
}

function updateStatus() {
    var status = "";

    var moveColor = "Đỏ";
    if (game.turn() === "b") {
        moveColor = "Đen";
    }

    // checkmate?
    if (game.in_checkmate()) {
        status = moveColor + " bị chiếu bí";
    }

    // draw?
    else if (game.in_draw()) {
        status = "Hòa";
    }

    // game still on
    else {
        status = "Tới lượt " + moveColor + " đi";

        // check?
        if (game.in_check()) {
            status += ", " + moveColor + " đang bị chiếu";
        }
    }

    if (game.turn() === "r") {
        document.getElementById("game-status").classList.remove("black");
        document.getElementById("game-status").classList.add("red");
    } else if (game.turn() === "b") {
        document.getElementById("game-status").classList.remove("red");
        document.getElementById("game-status").classList.add("black");
    }

    document.getElementById("game-status").innerHTML = status;
    document.getElementById("header-status").innerHTML = ": " + status;

    if (game.game_over()) {
        hetTran.play();
        document.getElementById("header-status").innerHTML =
            ": " + status + " - Hết trận";
        document.getElementById("game-over").classList.remove("d-none");
        document.getElementById("game-over").classList.add("d-inline-block");
    }
}

// hàm duyệt tất cả các vị trí bàn cờ để tính điểm lượng giá
function evaluateBoard(board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 9; j++) {
            totalEvaluation =
                totalEvaluation + getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isRed, x, y) {
        if (piece.type === "p") {
            //PAWN
            return 15 + (isRed ? pEvalRed[x][y] : pEvalBlack[x][y]);
        } else if (piece.type === "r") {
            //ROOK/CHARIOT
            return 90 + (isRed ? rEvalRed[x][y] : rEvalBlack[x][y]);
        } else if (piece.type === "c") {
            //CANNON
            return 45 + (isRed ? cEvalRed[x][y] : cEvalBlack[x][y]);
        } else if (piece.type === "n") {
            return 40 + (isRed ? nEvalRed[x][y] : nEvalBlack[x][y]);
        } else if (piece.type === "b") {
            return 20 + (isRed ? bEvalRed[x][y] : bEvalBlack[x][y]);
        } else if (piece.type === "a") {
            return 20 + (isRed ? aEvalRed[x][y] : aEvalBlack[x][y]);
        } else if (piece.type === "k") {
            return 900 + (isRed ? kEvalRed[x][y] : kEvalBlack[x][y]);
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === "r", x, y);
    return piece.color === "r" ? absoluteValue : -absoluteValue;
}

function reverseArray(array) {
    return array.slice().reverse();
}
//lượng giá con tốt
var pEvalRed = [
    [10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0],
    [10.0, 10.0, 11.0, 15.0, 20.0, 15.0, 11.0, 10.0, 10.0],
    [8.0, 10.0, 11.0, 15.0, 15.0, 15.0, 11.0, 10.0, 8.0],
    [7.0, 9.0, 10.0, 11.0, 11.0, 11.0, 10.0, 9.0, 7.0],
    [6.0, 8.0, 9.0, 10.0, 10.0, 10.0, 9.0, 8.0, 6.0],
    [1.0, 2.0, 3.0, 4.0, 4.0, 4.0, 3.0, 2.0, 1.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];

var pEvalBlack = reverseArray(pEvalRed);

//lượng giá con xe
var rEvalRed = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [-2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -2.0],
];

var rEvalBlack = reverseArray(rEvalRed);

// lượng giá con mã
var nEvalRed = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, -2.0, 0.0, 0.0, 0.0, 0.0, 0.0, -2.0, 0.0],
];

var nEvalBlack = reverseArray(nEvalRed);

//lượng giá con pháo
var cEvalRed = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];

var cEvalBlack = reverseArray(cEvalRed);

//lượng giá con tượng
var bEvalRed = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];

var bEvalBlack = reverseArray(bEvalRed);

//lượng giá con sĩ
var aEvalRed = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];

var aEvalBlack = reverseArray(aEvalRed);

//lượng giá con tướng
var kEvalRed = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0],
];

var kEvalBlack = reverseArray(kEvalRed);

var positionCount;

function getBestMove(game) {
    updateStatus();
    positionCount = 0;
    var depth = 4;
    var bestMove = minimaxRoot(depth, game, true);
    return bestMove;
}

function minimaxRoot(depth, game, isMaximisingPlayer) {
    var newGameMoves = game.ugly_moves();
    var bestMove = -9999;
    var bestMoveFound;

    for (var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i];
        game.ugly_move(newGameMove);
        var value = minimax(
            depth - 1,
            game,
            -10000,
            10000,
            !isMaximisingPlayer
        );
        game.undo();
        if (value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    return bestMoveFound;
}

function minimax(depth, game, alpha, beta, isMaximisingPlayer) {
    positionCount++;
    if (depth === 0) {
        return -evaluateBoard(game.board());
    }

    var newGameMoves = game.ugly_moves();

    if (isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            bestMove = Math.max(
                bestMove,
                minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer)
            );
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            bestMove = Math.min(
                bestMove,
                minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer)
            );
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
}

function makeBestMove() {
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
    board.position(game.fen());
    nuocCo.play();
    updateStatus();
}

function onDrop(source, target) {
    // see if the move is legal
    let move = game.move({
        from: source,
        to: target,
        promotion: "q", // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return "snapback";
    updateStatus();
    // make random legal move for black
    //window.setTimeout(makeRandomMove, 250);
    window.setTimeout(makeBestMove, 250);
}

function onMouseoverSquare(square, piece) {
    // get list of possible moves for this square
    let moves = game.moves({
        square: square,
        verbose: true,
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    // highlight the square they moused over
    greySquare(square);

    // highlight the possible squares for this piece
    for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
}

function onMouseoutSquare(square, piece) {
    removeGreySquares();
}

function removeGreySquares() {
    // Lấy tất cả các ô cần loại bỏ lớp 'highlight' bằng cách sử dụng phương thức querySelectorAll
    const squares = document.querySelectorAll("#myBoard .square-2b8ce");

    // Lặp qua từng ô và loại bỏ lớp 'highlight'
    squares.forEach((square) => {
        square.classList.remove("highlight");
    });
}

function greySquare(square) {
    // Lấy ô cần tô màu bằng cách sử dụng phương thức querySelector
    const squareElement = document.querySelector(`#myBoard .square-${square}`);
    console.log(squareElement);
    // Thêm lớp 'highlight' vào ô
    squareElement.classList.add("highlight");
}

function onSnapEnd() {
    board.position(game.fen());
    nuocCo.play();
    updateStatus();
}

function onDragStart(source, piece, position, orientation) {
    if (
        game.in_checkmate() === true ||
        game.in_draw() === true ||
        piece.search(/^b/) !== -1
    ) {
        return false;
    }
}
