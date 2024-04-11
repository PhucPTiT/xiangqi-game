let board = null;
let game = new Xiangqi();

const nuocCo = document.getElementById("nuoc-co");
const hetTran = document.getElementById("het-tran");

const config = {
    boardTheme: "../../docs/img/xiangqiboards/test.png",
    pieceTheme: "../../docs/img/xiangqipieces/wikimedia/{piece}.svg",
    orientation: "black",
    position: "start",
    showNotation: true,
    draggable: true,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd,
};

config.pieceTheme = "../../docs/img/xiangqipieces/graphic/{piece}.svg";
board = Xiangqiboard("#myBoard", config);

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

    // Call ws để load lượt đi đối thủ ở đây
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
        piece.search(/^r/) !== -1
    ) {
        return false;
    }
}
