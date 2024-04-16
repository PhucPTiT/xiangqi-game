const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const WS_PORT = 8081;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: WS_PORT });
let rooms = {};
let roomCounter = 1;

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log(`Received message from client: ${JSON.stringify(data)}`);
    if (data.action === "createRoom") {
      const roomId = roomCounter++;
      rooms[roomId] = { players: [ws], fen: null };
      ws.send(JSON.stringify({ action: "roomCreated", roomId, color: "red" }));
    } else if (data.action === "joinRoom" && data.roomId) {
      if (!rooms[data.roomId]) {
        console.error("Room not found");
        ws.send(
          JSON.stringify({
            action: "error",
            message: "Room not found",
          })
        );
        return;
      }
      const room = rooms[data.roomId];
      if (room.players.length < 2) {
        room.players.push(ws);
        ws.send(JSON.stringify({ action: "roomJoined", color: "black" }));
        if (room.players.length === 2) {
          room.players.forEach((client) => {
            client.send(JSON.stringify({ action: "startGame" }));
          });
        }
      } else {
        ws.send(
          JSON.stringify({
            action: "error",
            message: "Room Full",
          })
        );
      }
    } else if (data.action === "sendFEN" && data.roomId && data.fen) {
      if (rooms[data.roomId]) {
        // Kiểm tra xem rooms[data.roomId] tồn tại hay không
        const room = rooms[data.roomId];
        if (room && room.players) {
          // Kiểm tra xem room và room.players có tồn tại
          if (room.players.length === 2) {
            const opponent = room.players.find((client) => client !== ws);
            if (opponent) {
              opponent.send(
                JSON.stringify({
                  action: "receiveFEN",
                  fen: data.fen,
                })
              );
            } else {
              console.error("Opponent not found");
              ws.send(
                JSON.stringify({
                  action: "error",
                  message: "Opponent not found",
                })
              );
            }
          } else {
            console.error("Let's wait for the room to be full");
            ws.send(
              JSON.stringify({
                action: "error",
                message: "Let's wait for the room to be full",
              })
            );
          }
        } else {
          console.error("Room or players not found");
          ws.send(
            JSON.stringify({
              action: "error",
              message: "Room or players not found",
            })
          );
        }
      } else {
        console.error("Room not found");
        ws.send(
          JSON.stringify({
            action: "error",
            message: "Room not found",
          })
        );
      }
    } else if (data.action === "userData") {
      sendUserDataToOpponent(data, ws);
    }
  });

  ws.on("close", () => {
    // Xử lý khi một client ngắt kết nối, ví dụ: loại bỏ khỏi phòng
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const index = room.players.indexOf(ws);
      if (index > -1) {
        room.players.splice(index, 1);
        if (room.players.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

app.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

function sendUserDataToOpponent(userData, sender) {
  // Tìm đối thủ của người dùng
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const opponent = room.players.find((client) => client !== sender);
    if (opponent) {
      // Gửi thông tin người dùng cho đối thủ
      opponent.send(
        JSON.stringify({
          action: "userData",
          userData: userData.userData,
        })
      );
      break;
    }
  }
}

// Hàm kiểm tra tính hợp lệ của chuỗi FEN (tạm thời trả về chuỗi FEN)
function validateFEN(fen) {
  return fen;
}
