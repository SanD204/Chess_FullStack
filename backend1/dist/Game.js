"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Game {
    constructor(id, player1, player2, player1Name, player2Name) {
        this.moveCount = 0;
        this.timer = null;
        this.id = id;
        this.player1 = player1;
        this.player2 = player2;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.timeWhite = 180; // 3 minutes in seconds
        this.timeBlack = 180; // 3 minutes in seconds
        this.startTimer();
        if (this.player1) {
            this.player1.send(JSON.stringify({
                type: messages_1.INIT_GAME,
                payload: {
                    color: "white",
                    player1Name: this.player1Name,
                    player2Name: this.player2Name,
                },
            }));
        }
        if (this.player2) {
            this.player2.send(JSON.stringify({
                type: messages_1.INIT_GAME,
                payload: {
                    color: "black",
                    player1Name: this.player1Name,
                    player2Name: this.player2Name,
                },
            }));
        }
    }
    startTimer() {
        this.timer = setInterval(() => {
            if (this.board.turn() === "w") {
                this.timeWhite--;
                if (this.timeWhite <= 0) {
                    this.endGame("Black");
                }
            }
            else {
                this.timeBlack--;
                if (this.timeBlack <= 0) {
                    this.endGame("White");
                }
            }
        }, 1000);
    }
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    endGame(winner) {
        this.stopTimer();
        if (this.player1) {
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner,
                },
            }));
        }
        if (this.player2) {
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner,
                },
            }));
        }
    }
    makeMove(socket, move) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.board.turn() === "w" && socket !== this.player1) {
                return;
            }
            if (this.board.turn() === "b" && socket !== this.player2) {
                return;
            }
            try {
                this.board.move(move);
                yield prisma.move.create({
                    data: {
                        gameId: this.id,
                        player: socket === this.player1 ? "player1" : "player2",
                        from: move.from,
                        to: move.to,
                    },
                });
            }
            catch (e) {
                console.log(e);
                return;
            }
            if (this.moveCount % 2 === 0 && this.player2) {
                this.player2.send(JSON.stringify({
                    type: "move",
                    payload: move,
                }));
            }
            else if (this.player1) {
                this.player1.send(JSON.stringify({
                    type: "move",
                    payload: move,
                }));
            }
            if (this.board.isGameOver()) {
                var winner = this.board.turn() === "w" ? "Black" : "White";
                if (this.board.isStalemate()) {
                    winner = "None, Draw by Stalemate";
                }
                this.endGame(winner);
                return;
            }
            this.moveCount++;
        });
    }
    broadcastMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(message);
            if (this.player1) {
                this.player1.send(JSON.stringify({
                    type: messages_1.MESSAGE_RECEIVED,
                    payload: {
                        message: message,
                    },
                }));
            }
            if (this.player2) {
                this.player2.send(JSON.stringify({
                    type: messages_1.MESSAGE_RECEIVED,
                    payload: {
                        message: message,
                    },
                }));
            }
        });
    }
}
exports.Game = Game;
