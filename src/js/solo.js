let board = null;
let game = new Xiangqi();

const nuocCo = document.getElementById("nuoc-co");
const hetTran = document.getElementById("het-tran");
const gameCode = document.querySelector(".game-code");

let Turn = null;
let roomId = null;
let myColor = null;

const config = {
  boardTheme: "../../docs/img/xiangqiboards/test.png",
  pieceTheme: "../../docs/img/xiangqipieces/wikimedia/{piece}.svg",
  position: "start",
  showNotation: true,
  draggable: true,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};

const socket = new WebSocket("ws://localhost:8081");

socket.addEventListener("open", function (event) {
  console.log("Connected to WebSocket server");
  if (action === "createRoom") {
    const data = { action: "createRoom" };
    socket.send(JSON.stringify(data));
  }
  if (action === "joinRoom") {
    const data = { action: "joinRoom", roomId: roomIdParam };
    socket.send(JSON.stringify(data));
  }
});

const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get("action");
const roomIdParam = urlParams.get("roomId");

socket.addEventListener("message", function (event) {
  console.log("Received message from server:", event.data);
  const data = JSON.parse(event.data);
  if (data.action === "roomCreated") {
    roomId = data.roomId;
    console.log(roomId);
    Turn = "red";
    config.orientation = Turn;
    config.pieceTheme = "../../docs/img/xiangqipieces/graphic/{piece}.svg";
    board = Xiangqiboard("#myBoard", config);
    gameCode.innerHTML = `Mã trận đấu: ${roomId || roomIdParam}`;
    updateStatus();
  } else if (data.action === "roomJoined") {
    Turn = "black";
    config.orientation = Turn;
    config.pieceTheme = "../../docs/img/xiangqipieces/graphic/{piece}.svg";
    board = Xiangqiboard("#myBoard", config);
    updateStatus();
  } else if (data.action === "receiveFEN") {
    game.load(data.fen);
    board.position(data.fen);
    updateStatus();
  } else if (data.action === "error") {
    alert(data.message);
    window.location.href = "/src/home.html";
  }
});

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
  // document.getElementById("header-status").innerHTML = ": " + status;

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

  let fen = game.fen();
  console.log(
    JSON.stringify({
      action: "sendFEN",
      roomId: roomIdParam || roomId,
      fen,
    })
  );
  socket.send(
    JSON.stringify({
      action: "sendFEN",
      roomId: roomIdParam || roomId,
      fen,
    })
  );

  // Call ws để load lượt đi đối thủ ở đây
}

function onMouseoverSquare(square, piece) {
  // Kiểm tra xem có phải là lượt của quân đen không
  // Lấy danh sách các nước đi có thể cho quân cờ hiện tại
  let moves = game.moves({ square: square, verbose: true });

  // Kiểm tra nếu không có nước đi nào
  if (moves.length === 0) return;
  if (
    (Turn === "red" && piece.search(/^r/) === -1) ||
    (Turn === "black" && piece.search(/^b/) === -1)
  ) {
    return;
  }

  // Tô màu ô hiện tại
  greySquare(square);

  // Tô màu các ô có thể di chuyển tới
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
    (Turn === "black" && piece.search(/^b/) === -1) ||
    (Turn === "red" && piece.search(/^r/) === -1)
    // piece.search(/^b/) !== -1
  ) {
    return false;
  }
}
