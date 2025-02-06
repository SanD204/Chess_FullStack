import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const gameManager = new GameManager(prisma);

const wss = new WebSocketServer({ port: 8000 });
console.log("Server started on port 8000");

wss.on("connection", function connection(ws) {
  gameManager.addUser(ws);
  ws.on("close", () => gameManager.removeUser(ws));
});
