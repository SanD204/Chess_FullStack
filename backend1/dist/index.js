"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const gameManager = new GameManager_1.GameManager(prisma);
const wss = new ws_1.WebSocketServer({ port: 8000 });
console.log("Server started on port 8000");
wss.on("connection", function connection(ws) {
    gameManager.addUser(ws);
    ws.on("close", () => gameManager.removeUser(ws));
});
