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
        onSaveMatch("draw");
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
    // document.getElementById("header-status").innerHTML = ": " + status;

    if (game.game_over()) {
        if (moveColor === "Đỏ") {
            onSaveMatch("AI win");
        } else {
            onSaveMatch("user win");
        }
        hetTran.play();
        // document.getElementById("header-status").innerHTML =
        //     ": " + status + " - Hết trận";
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
    var depth = depthSearch;
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
var depthSearch = 1;
var modalID = 1;
//lấy thông tin các modal được lưu trong database
const level = new URLSearchParams(window.location.search).get("difficulty");
async function getModal() {
    try {
        const response = await fetch(
            `http://localhost:5000/api/modal/${level}`
        );

        // Kiểm tra nếu phản hồi không thành công
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const modals = await response.json();
        depthSearch = modals.depth;
        modalID = modals.id;

        // Kiểm tra nếu phản hồi trống hoặc không hợp lệ
        if (!modals) {
            throw new Error("JSON data is empty or invalid");
        }
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

getModal();

// hiển thị thông tin người chơi lên thẻ

const playerName = document.querySelector(".player-name");
const playerNickname = document.querySelector(".player-nickname");
const playerAddress = document.querySelector(".player-info");
const playerWin = document.querySelector(".player-win");

const user = JSON.parse(localStorage.getItem("currentUser"));

const regetUser = async () => {
    const response = await fetch(`http://localhost:5000/user/${user.id}`);
    const data = await response.json();
    localStorage.setItem("currentUser", JSON.stringify(data));
};
regetUser();

playerName.innerHTML = "Tài khoản: " + user.username;
playerNickname.innerHTML = `Biệt danh: ${user.nickname || "Chưa cập nhật"}`;
playerAddress.innerHTML = `Email: ${user.email || "Chưa cập nhật"}`;
playerWin.innerHTML = `Số trận thắng: ${user.winMatchs || 0}`;

//lưu kết quả trận đấu
const onSaveMatch = async (result) => {
    console.log("vao");
    const matchData = {
        userId: user.id,
        modalId: modalID,
        result: result,
    };

    const response = await fetch("http://localhost:5000/match", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
    });

    if (response.ok) {
        const data = await response.json();
        console.log("Match created:", data);
    } else {
        console.error("Error creating match:", response.statusText);
    }
};

// tổ hợp button
const quit = document.getElementById("home");
quit.addEventListener("click", () => {
    window.location.href = "/src/home.html";
});

const replay = document.getElementById("replay");
replay.addEventListener("click", () => {
    board.start();
    game.reset();
});
